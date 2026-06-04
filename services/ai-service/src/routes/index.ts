// AI Service — Routes
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, AppError, query } from "@loksewa/shared-utils";
import { handleChatTurn } from "../controllers/tutor.js";
import { chatCompletion, getEmbedding } from "../llm/client.js";
import { retrieveKnowledge } from "../rag/retriever.js";
import { renderPrompt, getPrompt } from "../prompts/templates.js";

const ChatSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
  language: z.enum(["ne", "en"]).default("en"),
  stream: z.boolean().default(false),
  context: z
    .object({
      topic: z.string().optional(),
      question_id: z.string().uuid().optional(),
      mode: z.enum(["free_chat", "explain_answer", "explain_concept", "generate_quiz", "study_plan", "mistake_review"]).optional(),
    })
    .optional(),
});

const ExplainAnswerSchema = z.object({
  question_text: z.string(),
  options: z.record(z.string()),
  student_choice: z.string(),
  correct_answer: z.string(),
  topic: z.string(),
  subtopic: z.string().optional(),
  verified_explanation: z.string().optional(),
  language: z.enum(["ne", "en"]).default("en"),
});

const GenerateQuizSchema = z.object({
  topic: z.string(),
  subtopic: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).default(3),
  count: z.number().int().min(1).max(20).default(5),
  language: z.enum(["ne", "en"]).default("en"),
});

function err(reply: any, err: unknown) {
  if (err instanceof AppError) return reply.status(err.statusCode).send({ success: false, error: err.toJSON() });
  if (err instanceof z.ZodError) return reply.status(400).send({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid" } });
  reply.log.error({ err }, "Unhandled");
  return reply.status(500).send({ success: false, error: { code: "INTERNAL_ERROR" } });
}

export async function registerRoutes(app: FastifyInstance<any, any, any, any>) {
  // Main chat
  app.post("/v1/tutor/chat", async (req, reply) => {
    try {
      const auth = await authenticate(req);
      const body = ChatSchema.parse(req.body);
      const result = await handleChatTurn(auth.sub, body);
      return reply.send({
        success: true,
        data: {
          conversation_id: result.conversation_id,
          turn_id: result.turn_id,
          response: result.response,
          citations: result.citations,
          source: result.source,
          model: result.model,
          tokens_used: result.tokens_used,
          latency_ms: result.latency_ms,
        },
      });
    } catch (e) {
      return err(reply, e);
    }
  });

  // Explain wrong answer
  app.post("/v1/tutor/explain-answer", async (req, reply) => {
    try {
      const auth = await authenticate(req);
      const body = ExplainAnswerSchema.parse(req.body);

      const prompt = renderPrompt(getPrompt("EXPLAIN_WRONG_ANSWER", body.language), {
        question_text: body.question_text,
        opt_a: body.options.A ?? "",
        opt_b: body.options.B ?? "",
        opt_c: body.options.C ?? "",
        opt_d: body.options.D ?? "",
        student_choice: body.student_choice,
        correct_answer: body.correct_answer,
        topic: body.topic,
        subtopic: body.subtopic ?? "",
        verified_explanation: body.verified_explanation ?? "",
        language: body.language,
      });

      const result = await chatCompletion([
        { role: "user", content: prompt },
      ], { temperature: 0.6, max_tokens: 800 });

      return reply.send({
        success: true,
        data: {
          explanation: result.content,
          tokens_used: result.total_tokens,
        },
      });
    } catch (e) {
      return err(reply, e);
    }
  });

  // Generate quiz
  app.post("/v1/tutor/generate-quiz", async (req, reply) => {
    try {
      const auth = await authenticate(req);
      const body = GenerateQuizSchema.parse(req.body);

      const prompt = renderPrompt(getPrompt("GENERATE_QUIZ", body.language), {
        topic: body.topic,
        subtopic: body.subtopic ?? "",
        difficulty: String(body.difficulty),
        count: String(body.count),
        language: body.language,
      });

      const result = await chatCompletion([
        { role: "user", content: prompt },
      ], { temperature: 0.8, max_tokens: 2000 });

      let questions: unknown[] = [];
      try {
        const jsonMatch = result.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      } catch {
        // AI didn't return valid JSON
      }

      return reply.send({
        success: true,
        data: {
          questions,
          raw_response: result.content,
          tokens_used: result.total_tokens,
        },
      });
    } catch (e) {
      return err(reply, e);
    }
  });

  // Knowledge search (no LLM, just RAG retrieval)
  app.post("/v1/tutor/search", async (req, reply) => {
    try {
      const auth = await authenticate(req);
      const body = z.object({ query: z.string(), limit: z.number().int().min(1).max(20).default(5) }).parse(req.body);
      const chunks = await retrieveKnowledge(body.query, { limit: body.limit });
      return reply.send({ success: true, data: { results: chunks } });
    } catch (e) {
      return err(reply, e);
    }
  });

  // Conversation history
  app.get("/v1/tutor/conversations", async (req, reply) => {
    try {
      const auth = await authenticate(req);
      const result = await query(
        `SELECT id, title, mode, topic, started_at, last_active_at, total_turns
         FROM ai_conversations WHERE user_id = $1
         ORDER BY last_active_at DESC LIMIT 50`,
        [auth.sub]
      );
      return reply.send({ success: true, data: { conversations: result.rows } });
    } catch (e) { return err(reply, e); }
  });

  app.get("/v1/tutor/conversations/:id/messages", async (req, reply) => {
    try {
      const auth = await authenticate(req);
      const { id } = req.params as { id: string };
      const result = await query(
        `SELECT id, role, content, citations, source, feedback, created_at
         FROM ai_messages
         WHERE conversation_id = $1 AND user_id = $2
         ORDER BY turn_index ASC`,
        [id, auth.sub]
      );
      return reply.send({ success: true, data: { messages: result.rows } });
    } catch (e) { return err(reply, e); }
  });

  // Feedback
  app.post("/v1/tutor/messages/:id/feedback", async (req, reply) => {
    try {
      const auth = await authenticate(req);
      const { id } = req.params as { id: string };
      const body = z.object({ feedback: z.enum(["up", "down"]), text: z.string().optional() }).parse(req.body);
      await query(
        `UPDATE ai_messages SET feedback = $1, feedback_text = $2
         WHERE id = $3 AND user_id = $4`,
        [body.feedback, body.text ?? null, id, auth.sub]
      );
      return reply.send({ success: true });
    } catch (e) { return err(reply, e); }
  });
}
