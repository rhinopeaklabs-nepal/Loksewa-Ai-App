// Memory Service — Collect, extract, embed, retrieve with semantic understanding
import { query, withTransaction } from "@loksewa/shared-utils";
import { v4 as uuidv4 } from "uuid";
import type { Memory } from "@loksewa/shared-types";
import { getEmbedding } from "./embeddings.js";

type MemoryType = Memory["memory_type"];

export interface CreateMemoryInput {
  user_id: string;
  memory_type: MemoryType;
  fact: string;
  fact_ne?: string;
  category?: string;
  importance?: number;
  confidence?: number;
  source_event_id?: string;
  source_event_type?: string;
  embedding?: number[];
  expires_at?: Date;
  context?: Record<string, unknown>; // Additional context for richer memories
}

export async function createMemory(input: CreateMemoryInput): Promise<Memory> {
  // Generate embedding if not provided
  const embedding = input.embedding ?? (await getEmbedding(input.fact));
  const embeddingId = embedding ? uuidv4() : null;

  const result = await withTransaction(async (client) => {
    const memoryResult = await client.query<Memory>(
      `INSERT INTO user_memories (
         user_id, memory_type, fact, fact_ne, category, importance, confidence,
         source_event_id, source_event_type, embedding_id, expires_at, context_data
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        input.user_id,
        input.memory_type,
        input.fact,
        input.fact_ne ?? null,
        input.category ?? null,
        input.importance ?? 3,
        input.confidence ?? 0.7,
        input.source_event_id ?? null,
        input.source_event_type ?? null,
        embeddingId,
        input.expires_at ?? null,
        JSON.stringify(input.context ?? {}),
      ]
    );

    // Also store embedding in Qdrant-like structure (simplified for now)
    // In production, this would go to actual Qdrant service
    if (embeddingId && embedding) {
      await client.query(
        `INSERT INTO memory_embeddings (id, user_id, embedding, memory_id, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE SET
           embedding = EXCLUDED.embedding,
           updated_at = NOW()`,
        [embeddingId, input.user_id, embedding, memoryResult.rows[0].id]
      );
    }

    return memoryResult;
  });

  return result.rows[0]!;
}

export async function getUserMemories(
  userId: string,
  options: { type?: MemoryType; limit?: number; minImportance?: number; includeContext?: boolean } = {}
): Promise<Memory[]> {
  const result = await query<Memory>(
    `SELECT * FROM user_memories
     WHERE user_id = $1 AND is_active = true
       ${options.type ? "AND memory_type = $2" : ""}
       ${options.minImportance ? `AND importance >= $${options.type ? 3 : 2}` : ""}
     ORDER BY importance DESC, created_at DESC
     LIMIT $${options.type ? (options.minImportance ? 4 : 3) : options.minImportance ? 3 : 2}`,
    [
      userId,
      ...(options.type ? [options.type] : []),
      ...(options.minImportance ? [options.minImportance] : []),
      options.limit ?? 20,
    ]
  );
  return result.rows;
}

export async function extractMemoriesFromEvent(
  userId: string,
  event: {
    event_type: string;
    payload: Record<string, unknown>;
  }
): Promise<Memory[]> {
  const extracted: Memory[] = [];

  switch (event.event_type) {
    case "question.answered": {
      const p = event.payload as any;
      
      // Extract struggle memory
      if (p.is_correct === false) {
        const struggleKey = `struggle:${p.topic}:${p.subtopic ?? ""}`;
        const existing = await checkExistingFact(userId, struggleKey);
        if (!existing) {
          const mem = await createMemory({
            user_id: userId,
            memory_type: "learning",
            fact: `User struggled with ${p.topic}${p.subtopic ? ` / ${p.subtopic}` : ""}`,
            fact_ne: `उपयोगकर्ता ${p.topic}${p.subtopic ? ` / ${p.subtopic}` : ""} मा सिर्जना गर्छ`,
            category: "weakness",
            importance: Math.min(5, 3 + Math.floor((1 - (p.confidence ?? 0.5)) * 2)), // Higher importance for low confidence
            confidence: p.confidence ?? 0.7,
            source_event_type: event.event_type,
            context: {
              question_id: p.question_id,
              difficulty: p.difficulty,
              time_taken_ms: p.time_taken_ms,
              selected_option: p.selected_option,
              correct_answer: p.correct_answer
            }
          });
          extracted.push(mem);
        }
      } else {
        // Correct answer - extract mastery memory
        if ((p.confidence ?? 0.5) > 0.8 && p.time_taken_ms < 5000) { // Quick correct answer
          const masteryKey = `mastery:${p.topic}:${p.subtopic ?? ""}`;
          const existing = await checkExistingFact(userId, masteryKey);
          if (!existing) {
            const mem = await createMemory({
              user_id: userId,
              memory_type: "learning",
              fact: `User demonstrates strong understanding of ${p.topic}${p.subtopic ? ` / ${p.subtopic}` : ""}`,
              fact_ne: `उपयोगकर्ता ${p.topic}${p.subtopic ? ` / ${p.subtopic}` : ""} मा मजबूत बुझाइ देखाउँछ`,
              category: "strength",
              importance: 4,
              confidence: 0.8,
              source_event_type: event.event_type,
              context: {
                question_id: p.question_id,
                difficulty: p.difficulty,
                time_taken_ms: p.time_taken_ms
              }
            });
            extracted.push(mem);
          }
        }
      }
      break;
    }

    case "quiz.completed": {
      const p = event.payload as any;
      
      // High accuracy memory
      if (p.accuracy >= 0.9) {
        const mem = await createMemory({
          user_id: userId,
          memory_type: "learning",
          fact: `User achieved ${Math.round(p.accuracy * 100)}% accuracy in a recent quiz`,
          fact_ne: `उपयोगकर्ता हालको क्विज मा ${Math.round(p.accuracy * 100)}% सटिकता हासिल गरे`,
          category: "strength",
          importance: 4,
          confidence: 0.7,
          source_event_type: event.event_type,
          context: {
            quiz_id: p.quiz_id,
            total_questions: p.total_questions,
            correct_count: p.correct_count
          }
        });
        extracted.push(mem);
      }
      
      // Low accuracy memory - identify weak areas
      if (p.accuracy < 0.6 && p.total_questions >= 5) {
        const mem = await createMemory({
          user_id: userId,
          memory_type: "learning",
          fact: `User scored below 60% (${Math.round(p.accuracy * 100)}%) in recent quiz - needs review`,
          fact_ne: `उपयोगकर्ता हालको क्विज मा 60% को भन्दा कम (${Math.round(p.accuracy * 100)}%) स्कोर गरे - समीक्षा आवश्यक`,
          category: "weakness",
          importance: 5,
          confidence: 0.8,
          source_event_type: event.event_type,
          context: {
            quiz_id: p.quiz_id,
            total_questions: p.total_questions,
            correct_count: p.correct_count,
            weak_topics: p.weak_topics ?? []
          }
        });
        extracted.push(mem);
      }
      break;
    }

    case "user.target_exam_set": {
      const p = event.payload as any;
      const mem = await createMemory({
        user_id: userId,
        memory_type: "longterm",
        fact: `User is preparing for ${p.target_exam}`,
        fact_ne: `उपयोगकर्ता ${p.target_exam} को तयारी garey chan`,
        category: "preference",
        importance: 5,
        confidence: 1.0,
        source_event_type: event.event_type,
        context: {
          exam_target: p.target_exam,
          exam_date: p.exam_date ?? null
        }
      });
      extracted.push(mem);
      break;
    }

    case "study_session.completed": {
      const p = event.payload as any;
      
      // Extract study pattern memories
      if (p.duration_minutes >= 30) { // Significant study session
        const timeOfDay = new Date().getHours();
        let timeCategory = "unknown";
        if (timeOfDay >= 5 && timeOfDay < 12) timeCategory = "morning";
        else if (timeOfDay >= 12 && timeOfDay < 17) timeCategory = "afternoon";
        else if (timeOfDay >= 17 && timeOfDay < 21) timeCategory = "evening";
        else timeCategory = "night";
        
        const mem = await createMemory({
          user_id: userId,
          memory_type: "behavioral",
          fact: `User prefers studying in the ${timeCategory} (${p.duration_minutes} minute session)`,
          fact_ne: `उपयोगकर्ता ${timeCategory} मा पढ्ने हुन मान्छे (${p.duration_minutes} मिनेटको सेशन)`,
          category: "habit",
          importance: 3,
          confidence: 0.6,
          source_event_type: event.event_type,
          context: {
            duration_minutes: p.duration_minutes,
            topics_studied: p.topics_studied ?? [],
            questions_answered: p.questions_answered ?? 0
          }
        });
        extracted.push(mem);
      }
      
      // Extract fatigue patterns
      if (p.focus_score !== undefined && p.focus_score < 0.4) {
        const mem = await createMemory({
          user_id: userId,
          memory_type: "behavioral",
          fact: `User shows signs of mental fatigue after ${p.duration_minutes} minutes of study`,
          fact_ne: `उपयोगकर्ता ${p.duration_minutes} मिनेट पढन पछि मानसिक थकानको लक्षण देखाउँछ`,
          category: "limitation",
          importance: 4,
          confidence: 0.7,
          source_event_type: event.event_type,
          context: {
            duration_minutes: p.duration_minutes,
            focus_score: p.focus_score
          }
        });
        extracted.push(mem);
      }
      break;
    }

    case "ai.conversation.started": {
      const p = event.payload as any;
      // Extract learning preferences from AI interactions
      if (p.language_preference) {
        const mem = await createMemory({
          user_id: userId,
          memory_type: "knowledge",
          fact: `User prefers ${p.language_preference} language for explanations`,
          fact_ne: `उपयोगकर्ता स्पष्टीकरणको लागि ${p.language_preference} भाषा मा प्राधान्य दिन्छ`,
          category: "preference",
          importance: 4,
          confidence: 0.8,
          source_event_type: event.event_type,
          context: {
            language: p.language_preference,
            conversation_id: p.conversation_id
          }
        });
        extracted.push(mem);
      }
      
      // Extract topic interest from conversation depth
      if (p.topic && p.engagement_score > 0.7) {
        const mem = await createMemory({
          user_id: userId,
          memory_type: "knowledge",
          fact: `User shows strong interest in ${p.topic} based on AI conversation depth`,
          fact_ne: `उपयोगकर्ता AI वार्तालापको गहिराइमा आधारित ${p.topic} मा मजबूत रुचि देखाउँछ`,
          category: "interest",
          importance: 3,
          confidence: p.engagement_score,
          source_event_type: event.event_type,
          context: {
            topic: p.topic,
            conversation_id: p.conversation_id,
            engagement_score: p.engagement_score
          }
        });
        extracted.push(mem);
      }
      break;
    }

    // Add more extraction rules as needed
  }

  return extracted;
}

async function checkExistingFact(userId: string, key: string): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM user_memories
     WHERE user_id = $1 AND fact LIKE $2 AND is_active = true LIMIT 1`,
    [userId, `%${key}%`]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteMemory(memoryId: string, userId: string): Promise<boolean> {
  const result = await withTransaction(async (client) => {
    // Delete from embeddings table first
    await client.query(
      `DELETE FROM memory_embeddings WHERE memory_id = $1`,
      [memoryId]
    );
    
    // Soft delete from memories
    const memoryResult = await client.query(
      `UPDATE user_memories SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [memoryId, userId]
    );
    
    return memoryResult;
  });
  
  return (result.rowCount ?? 0) > 0;
}

export async function updateMemoryImportance(
  memoryId: string,
  userId: string,
  importance: number
): Promise<void> {
  await query(
    `UPDATE user_memories SET importance = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3`,
    [Math.max(1, Math.min(5, importance)), memoryId, userId]
  );
}

// New function for semantic memory search
export async function searchMemoriesSemantically(
  userId: string,
  queryText: string,
  options: { 
    limit?: number; 
    minConfidence?: number;
    memoryTypes?: MemoryType[];
  } = {}
): Promise<Memory[]> {
  // In production, this would use actual vector similarity search
  // For now, we'll use text search with importance weighting
  await getEmbedding(queryText);

  const params: unknown[] = [userId];
  const wheres = ["m.user_id = $1", "m.is_active = true"];

  if (options.memoryTypes && options.memoryTypes.length > 0) {
    params.push(options.memoryTypes);
    wheres.push(`m.memory_type = ANY($${params.length}::text[])`);
  }

  if (options.minConfidence !== undefined) {
    params.push(options.minConfidence);
    wheres.push(`m.confidence >= $${params.length}`);
  }

  params.push(`%${queryText}%`);
  const textSearchParam = params.length;

  params.push(options.limit ?? 10);
  const limitParam = params.length;
  
  const result = await query<Memory>(
    `SELECT m.*, 
            (CASE WHEN m.embedding_id IS NOT NULL THEN 0.8 ELSE 0.2 END) as base_score
     FROM user_memories m
     WHERE ${wheres.join(" AND ")}
     ORDER BY 
       CASE 
         WHEN m.embedding_id IS NOT NULL THEN 
           0.9 
         ELSE 
           CASE WHEN m.fact ILIKE $${textSearchParam} THEN 0.7 ELSE 0.3 END
       END DESC,
       m.importance DESC,
       m.confidence DESC
     LIMIT $${limitParam}`,
    params
  );
  
  return result.rows;
}

// Server
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { z } from "zod";
import { logger, loadConfig, checkHealth, closePool, authenticate, AppError } from "@loksewa/shared-utils";

loadConfig("memory-service");
const PORT = Number(process.env.SERVICE_PORT) || 3008;

const app = Fastify({ logger, trustProxy: true });
await app.register(helmet);
await app.register(cors, { origin: true, credentials: true });

app.get("/healthz", async () => ({ status: "ok", service: "memory-service" }));
app.get("/readyz", async () => ({ status: (await checkHealth()) ? "ready" : "not_ready" }));

app.get("/v1/users/me/memories", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const q = z.object({
      type: z.enum(["session", "longterm", "learning", "behavioral", "knowledge"]).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      min_importance: z.coerce.number().int().min(1).max(5).optional(),
    }).parse(req.query);
    const memories = await getUserMemories(auth.sub, q);
    return reply.send({ success: true, data: { memories } });
  } catch (e) { handleErr(reply, e); }
});

app.delete("/v1/users/me/memories/:id", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const { id } = req.params as { id: string };
    await deleteMemory(id, auth.sub);
    return reply.send({ success: true });
  } catch (e) { handleErr(reply, e); }
});

app.patch("/v1/users/me/memories/:id/importance", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const { id } = req.params as { id: string };
    const body = z.object({ importance: z.number().int().min(1).max(5) }).parse(req.body);
    await updateMemoryImportance(id, auth.sub, body.importance);
    return reply.send({ success: true });
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
logger.info({ port: PORT }, "🧩 memory-service listening");
