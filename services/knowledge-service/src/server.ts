// Knowledge Service — Question management + RAG ingestion
import { query, withTransaction } from "@loksewa/shared-utils";
import type { Question } from "@loksewa/shared-types";
import { getEmbedding } from "./embeddings.js";

// ============ Question Operations ============
export async function getQuestionById(id: string): Promise<Question | null> {
  const result = await query<Question>(
    `SELECT * FROM questions WHERE id = $1 AND is_published = true`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function searchQuestions(
  options: {
    topic?: string;
    subtopic?: string;
    difficulty?: number;
    limit?: number;
    exclude_ids?: string[];
    randomize?: boolean;
  } = {}
): Promise<Question[]> {
  const params: unknown[] = [];
  const wheres: string[] = ["is_published = true", "verified = true"];

  if (options.topic) { params.push(options.topic); wheres.push(`topic = $${params.length}`); }
  if (options.subtopic) { params.push(options.subtopic); wheres.push(`subtopic = $${params.length}`); }
  if (options.difficulty) { params.push(options.difficulty); wheres.push(`difficulty = $${params.length}`); }
  if (options.exclude_ids && options.exclude_ids.length > 0) {
    params.push(options.exclude_ids);
    wheres.push(`id != ALL($${params.length}::uuid[])`);
  }

  const limit = options.limit ?? 10;
  const order = options.randomize ? "ORDER BY RANDOM()" : "ORDER BY created_at DESC";

  const result = await query<Question>(
    `SELECT * FROM questions WHERE ${wheres.join(" AND ")} ${order} LIMIT ${limit}`,
    params
  );
  return result.rows;
}

export async function selectQuestionsForMission(
  requests: { topic: string; subtopic?: string; difficulty: number; purpose: string }[]
): Promise<Question[]> {
  const questions: Question[] = [];
  const excludeIds: string[] = [];

  for (const req of requests) {
    const result = await searchQuestions({
      topic: req.topic,
      subtopic: req.subtopic,
      difficulty: req.difficulty,
      limit: 1,
      exclude_ids: excludeIds,
      randomize: true,
    });
    if (result[0]) {
      questions.push(result[0]);
      excludeIds.push(result[0].id);
    }
  }

  return questions;
}

export async function bulkImportQuestions(
  questions: Partial<Question>[],
  sourceId?: string
): Promise<{ imported: number; failed: number; errors: any[] }> {
  const errors: any[] = [];
  let imported = 0;

  await withTransaction(async (client) => {
    for (const [i, q] of questions.entries()) {
      try {
        if (!q.question_text || !q.correct_answer || !q.topic) {
          errors.push({ index: i, error: "Missing required fields" });
          continue;
        }
        await client.query(
          `INSERT INTO questions (
             source_id, topic, subtopic, exam_target, question_type, difficulty,
             question_text, question_text_ne, options, correct_answer,
             explanation, explanation_ne, tags, language, verified
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            sourceId ?? q.source_id ?? null,
            q.topic,
            q.subtopic ?? null,
            q.exam_target ?? null,
            q.question_type ?? "mcq",
            q.difficulty ?? 3,
            q.question_text,
            q.question_text_ne ?? null,
            q.options ? JSON.stringify(q.options) : null,
            q.correct_answer,
            q.explanation ?? null,
            q.explanation_ne ?? null,
            q.tags ?? [],
            q.language ?? "en",
            q.verified ?? false,
          ]
        );
        imported++;
      } catch (err) {
        errors.push({ index: i, error: String(err) });
      }
    }
  });

  return { imported, failed: errors.length, errors };
}

// Server
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { z } from "zod";
import { logger, loadConfig, checkHealth, closePool, authenticate, AppError } from "@loksewa/shared-utils";

loadConfig("knowledge-service");
const PORT = Number(process.env.SERVICE_PORT) || 3007;

const app = Fastify({ logger, trustProxy: true });
await app.register(helmet);
await app.register(cors, { origin: true, credentials: true });

app.get("/healthz", async () => ({ status: "ok", service: "knowledge-service" }));
app.get("/readyz", async () => ({ status: (await checkHealth()) ? "ready" : "not_ready" }));

app.get("/v1/questions/:id", async (req, reply) => {
  try {
    const { id } = req.params as { id: string };
    const q = await getQuestionById(id);
    if (!q) return reply.status(404).send({ success: false, error: { code: "NOT_FOUND" } });
    return reply.send({ success: true, data: { question: q } });
  } catch (e) { handleErr(reply, e); }
});

app.get("/v1/questions", async (req, reply) => {
  try {
    const q = z.object({
      topic: z.string().optional(),
      subtopic: z.string().optional(),
      difficulty: z.coerce.number().int().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }).parse(req.query);
    const questions = await searchQuestions(q);
    return reply.send({ success: true, data: { questions } });
  } catch (e) { handleErr(reply, e); }
});

app.post("/v1/questions/select", async (req, reply) => {
  try {
    const body = z.object({
      requests: z.array(z.object({
        topic: z.string(),
        subtopic: z.string().optional(),
        difficulty: z.number().int().min(1).max(5),
        purpose: z.string(),
      })),
    }).parse(req.body);
    const questions = await selectQuestionsForMission(body.requests);
    return reply.send({ success: true, data: { questions } });
  } catch (e) { handleErr(reply, e); }
});

app.get("/v1/topics", async (req, reply) => {
  try {
    const result = await query(
      `SELECT DISTINCT topic, COUNT(*) as question_count FROM questions
       WHERE is_published = true AND verified = true
       GROUP BY topic ORDER BY topic`
    );
    return reply.send({ success: true, data: { topics: result.rows } });
  } catch (e) { handleErr(reply, e); }
});

app.get("/v1/search", async (req, reply) => {
  try {
    const q = z.object({ q: z.string().min(1), limit: z.coerce.number().int().min(1).max(50).default(10) }).parse(req.query);
    const result = await query<Question>(
      `SELECT * FROM questions
       WHERE is_published = true AND verified = true
         AND (question_text ILIKE $1 OR question_text_ne ILIKE $1)
       LIMIT $2`,
      [`%${q.q}%`, q.limit]
    );
    return reply.send({ success: true, data: { questions: result.rows } });
  } catch (e) { handleErr(reply, e); }
});

app.post("/v1/admin/questions/bulk-import", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    if (!["admin", "content_reviewer"].includes(auth.role)) {
      return reply.status(403).send({ success: false, error: { code: "FORBIDDEN" } });
    }
    const body = z.object({
      questions: z.array(z.any()),
      source_id: z.string().uuid().optional(),
    }).parse(req.body);
    const result = await bulkImportQuestions(body.questions, body.source_id);
    return reply.send({ success: true, data: result });
  } catch (e) { handleErr(reply, e); }
});

function handleErr(reply: any, err: unknown) {
  if (err instanceof AppError) return reply.status(err.statusCode).send({ success: false, error: err.toJSON() });
  if (err instanceof z.ZodError) return reply.status(400).send({ success: false, error: { code: "VALIDATION_ERROR" } });
  reply.log.error({ err }, "Unhandled");
  return reply.status(500).send({ success: false });
}

const shutdown = async () => { await app.close(); await closePool(); process.exit(0); };
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
await app.listen({ port: PORT, host: "0.0.0.0" });
logger.info({ port: PORT }, "📚 knowledge-service listening");
