// Notification Service — Push, email, in-app
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { z } from "zod";
import { logger, loadConfig, checkHealth, closePool, authenticate, AppError, query } from "@loksewa/shared-utils";

loadConfig("notification-service");
const PORT = Number(process.env.SERVICE_PORT) || 3010;

const app = Fastify({ logger, trustProxy: true });
await app.register(helmet);
await app.register(cors, { origin: true, credentials: true });

app.get("/healthz", async () => ({ status: "ok", service: "notification-service" }));

// List notifications
app.get("/v1/notifications", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [auth.sub]
    );
    return reply.send({ success: true, data: { notifications: result.rows } });
  } catch (e) { handleErr(reply, e); }
});

// Mark as read
app.post("/v1/notifications/:id/read", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const { id } = req.params as { id: string };
    await query(
      `UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2`,
      [id, auth.sub]
    );
    return reply.send({ success: true });
  } catch (e) { handleErr(reply, e); }
});

// Internal: send notification (called by other services)
app.post("/v1/internal/send", async (req, reply) => {
  try {
    const body = z.object({
      user_id: z.string().uuid(),
      type: z.string(),
      title: z.string(),
      body: z.string(),
      title_ne: z.string().optional(),
      body_ne: z.string().optional(),
      data: z.record(z.any()).optional(),
      channels: z.array(z.enum(["in_app", "push", "email", "sms"])).default(["in_app"]),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
    }).parse(req.body);

    const result = await query<{ id: string }>(
      `INSERT INTO notifications (user_id, type, title, body, title_ne, body_ne, data, channels, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [body.user_id, body.type, body.title, body.body, body.title_ne ?? null, body.body_ne ?? null,
       body.data ? JSON.stringify(body.data) : null, body.channels, body.priority]
    );

    // Push to FCM would happen here
    // Email via SendGrid here
    // For now, log
    logger.info({ user_id: body.user_id, type: body.type }, "📬 Notification queued");

    return reply.send({ success: true, data: { id: result.rows[0]?.id } });
  } catch (e) { handleErr(reply, e); }
});

// Streak warning scheduler (runs daily)
async function sendStreakWarnings() {
  const today = new Date().toISOString().split("T")[0]!;
  const result = await query<{ user_id: string; current_streak: number }>(
    `SELECT user_id, current_streak FROM user_streaks
     WHERE current_streak >= 3
       AND last_active_date < $1::date - INTERVAL '1 day'
       AND last_active_date >= $1::date - INTERVAL '2 days'`,
    [today]
  );
  for (const row of result.rows) {
    await query(
      `INSERT INTO notifications (user_id, type, title, body, body_ne, channels, priority)
       VALUES ($1, 'streak_warning', 'Streak at risk!', $2, $3, '{push,in_app}', 'high')`,
      [row.user_id,
       `Your ${row.current_streak}-day streak ends in hours. Practice now!`,
       `तपाईंको ${row.current_streak} दिनको स्ट्रिक जोखिममा छ। अहिले अभ्यास गर्नुहोस्!`]
    );
  }
  logger.info({ count: result.rows.length }, "Streak warnings sent");
}

// Run daily
setInterval(sendStreakWarnings, 24 * 60 * 60 * 1000);

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
logger.info({ port: PORT }, "🔔 notification-service listening");
