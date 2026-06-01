// Analytics Service — Event ingestion + Foundation Model data collection
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { z } from "zod";
import { logger, loadConfig, checkHealth, closePool, createConsumer, consume, AppError } from "@loksewa/shared-utils";
import { collectTrainingData, buildDataset, getTrainingStats } from "./foundation/dataCollector.js";

loadConfig("analytics-service");
const PORT = Number(process.env.SERVICE_PORT) || 3011;

const app = Fastify({ logger, trustProxy: true });
await app.register(helmet);
await app.register(cors, { origin: true, credentials: true });

app.get("/healthz", async () => ({ status: "ok", service: "analytics-service" }));

// Ingest event (HTTP fallback for clients that can't use Kafka)
app.post("/v1/events", async (req, reply) => {
  try {
    const body = z.object({
      event_type: z.string(),
      event_version: z.number().int().default(1),
      user_id: z.string().uuid().optional(),
      session_id: z.string().uuid().optional(),
      payload: z.record(z.any()),
      context: z.record(z.any()).optional(),
    }).parse(req.body);

    const { query } = await import("@loksewa/shared-utils");
    await query(
      `INSERT INTO events (event_type, event_version, user_id, session_id, payload, context, producer)
       VALUES ($1, $2, $3, $4, $5, $6, 'analytics-service-ingest')`,
      [body.event_type, body.event_version, body.user_id ?? null, body.session_id ?? null,
       JSON.stringify(body.payload), body.context ? JSON.stringify(body.context) : null]
    );
    return reply.send({ success: true });
  } catch (e) { handleErr(reply, e); }
});

// Dashboard data
app.get("/v1/analytics/dashboard", async (_req, reply) => {
  try {
    const { query } = await import("@loksewa/shared-utils");
    const [metrics, totals] = await Promise.all([
      query(`SELECT * FROM daily_metrics ORDER BY date DESC LIMIT 30`),
      query(`SELECT
        (SELECT COUNT(*) FROM events) as total_events,
        (SELECT COUNT(DISTINCT user_id) FROM events WHERE occurred_at > NOW() - INTERVAL '7 days') as wau,
        (SELECT COUNT(DISTINCT user_id) FROM events WHERE occurred_at > NOW() - INTERVAL '1 day') as dau`),
    ]);
    return reply.send({
      success: true,
      data: {
        recent_metrics: metrics.rows,
        totals: totals.rows[0],
      },
    });
  } catch (e) { handleErr(reply, e); }
});

// Foundation Model Engine endpoints
app.get("/v1/foundation/stats", async (_req, reply) => {
  try {
    const stats = await getTrainingStats();
    return reply.send({ success: true, data: stats });
  } catch (e) { handleErr(reply, e); }
});

app.post("/v1/foundation/collect", async (req, reply) => {
  try {
    const body = z.object({
      data_type: z.enum(["verified_qa", "ai_tutor", "student_mistakes", "teacher_notes", "government_docs", "behavior"]),
      since: z.string().datetime().optional(),
      limit: z.number().int().min(1).max(10000).default(1000),
    }).parse(req.body);
    
    const collected = await collectTrainingData(body.data_type, {
      since: body.since ? new Date(body.since) : undefined,
      limit: body.limit
    });
    
    return reply.send({ success: true, data: { collected } });
  } catch (e) { handleErr(reply, e); }
});

app.post("/v1/foundation/dataset/build", async (req, reply) => {
  try {
    const body = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      data_types: z.array(z.enum(["verified_qa", "ai_tutor", "student_mistakes", "teacher_notes", "government_docs", "behavior"])),
      min_quality: z.number().min(0).max(1).default(0.7),
      format: z.enum(["jsonl", "csv", "parquet"]).default("jsonl"),
    }).parse(req.body);
    
    const dataset = await buildDataset(body);
    return reply.send({ success: true, data: { dataset } });
  } catch (e) { handleErr(reply, e); }
});

app.get("/v1/foundation/datasets", async (_req, reply) => {
  try {
    const { query } = await import("@loksewa/shared-utils");
    const result = await query(
      `SELECT id, name, description, status, total_examples, size_bytes, 
              created_at, completed_at
       FROM foundation_datasets 
       ORDER BY created_at DESC LIMIT 50`
    );
    return reply.send({ success: true, data: { datasets: result.rows } });
  } catch (e) { handleErr(reply, e); }
});

app.get("/v1/foundation/datasets/:id", async (req, reply) => {
  try {
    const { id } = req.params as { id: string };
    const { query } = await import("@loksewa/shared-utils");
    const result = await query(
      `SELECT * FROM foundation_datasets WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) {
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND" } });
    }
    return reply.send({ success: true, data: { dataset: result.rows[0] } });
  } catch (e) { handleErr(reply, e); }
});

// Quality metrics for AI responses
app.get("/v1/analytics/ai-quality", async (_req, reply) => {
  try {
    const { query } = await import("@loksewa/shared-utils");
    const result = await query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as total_responses,
        COUNT(CASE WHEN feedback = 'up' THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN feedback = 'down' THEN 1 END) as negative_feedback,
        AVG(latency_ms) as avg_latency_ms,
        AVG(total_tokens) as avg_tokens
      FROM ai_messages
      WHERE role = 'assistant' AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `);
    return reply.send({ success: true, data: { quality_metrics: result.rows } });
  } catch (e) { handleErr(reply, e); }
});

// User engagement analytics
app.get("/v1/analytics/engagement", async (_req, reply) => {
  try {
    const { query } = await import("@loksewa/shared-utils");
    const result = await query(`
      WITH user_activity AS (
        SELECT 
          user_id,
          COUNT(DISTINCT DATE(occurred_at)) as active_days,
          COUNT(*) as total_events
        FROM events
        WHERE occurred_at > NOW() - INTERVAL '30 days'
        GROUP BY user_id
      )
      SELECT 
        AVG(active_days) as avg_active_days,
        AVG(total_events) as avg_events,
        COUNT(*) as active_users,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY active_days) as median_active_days
      FROM user_activity
    `);
    return reply.send({ success: true, data: { engagement: result.rows[0] } });
  } catch (e) { handleErr(reply, e); }
});

// Kafka consumer for real-time event aggregation and training data collection
async function startConsumer() {
  const consumer = createConsumer("analytics-service-aggregator");
  await consume(consumer, ["question.answered", "quiz.completed", "ai.conversation.created", "ai.feedback"], async (event) => {
    const { query } = await import("@loksewa/shared-utils");
    // Insert raw event
    await query(
      `INSERT INTO events (event_type, event_version, user_id, payload, producer)
       VALUES ($1, $2, $3, $4, $5)`,
      [event.event_type, event.event_version, event.user_id ?? null, JSON.stringify(event.payload), event.producer]
    );
    // Update daily aggregates
    if (event.user_id) {
      const today = new Date().toISOString().split("T")[0]!;
      await query(
        `INSERT INTO daily_active_users (date, user_id, total_events)
         VALUES ($1, $2, 1)
         ON CONFLICT (date, user_id) DO UPDATE
           SET total_events = daily_active_users.total_events + 1`,
        [today, event.user_id]
      );
    }
    
    // Collect training data silently in the background
    try {
      if (event.event_type === "ai.conversation.created") {
        await collectTrainingData("ai_tutor", { limit: 1 });
      } else if (event.event_type === "question.answered") {
        await collectTrainingData("verified_qa", { limit: 1 });
      }
    } catch (err) {
      logger.warn({ err }, "Training data collection failed (non-critical)");
    }
  });
  logger.info("Analytics Kafka consumer started");
}

function handleErr(reply: any, err: unknown) {
  if (err instanceof AppError) return reply.status(err.statusCode).send({ success: false, error: err.toJSON() });
  if (err instanceof z.ZodError) return reply.status(400).send({ success: false, error: { code: "VALIDATION_ERROR" } });
  reply.log.error({ err }, "Unhandled");
  return reply.status(500).send({ success: false });
}

const shutdown = async () => { await app.close(); await closePool(); process.exit(0); };
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startConsumer().catch((err) => logger.error({ err }, "Consumer failed to start"));

await app.listen({ port: PORT, host: "0.0.0.0" });
logger.info({ port: PORT }, "📊 analytics-service listening");
