// User Service — Profile management
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { z } from "zod";
import { logger, loadConfig, checkHealth, closePool, authenticate, AppError, query } from "@loksewa/shared-utils";

loadConfig("user-service");
const PORT = Number(process.env.SERVICE_PORT) || 3002;

const app = Fastify({ logger, trustProxy: true });
await app.register(helmet);
await app.register(cors, { origin: true, credentials: true });

app.get("/healthz", async () => ({ status: "ok", service: "user-service" }));

app.get("/v1/profiles/me", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const result = await query(`SELECT * FROM user_profiles WHERE user_id = $1`, [auth.sub]);
    return reply.send({ success: true, data: { profile: result.rows[0] ?? null } });
  } catch (e) { handleErr(reply, e); }
});

app.patch("/v1/profiles/me", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const body = z.object({
      full_name: z.string().optional(),
      district: z.string().optional(),
      province: z.string().optional(),
      institution: z.string().optional(),
      preparation_level: z.enum(["beginner", "intermediate", "advanced", "final"]).optional(),
      target_exam_date: z.string().optional(),
      daily_study_goal_minutes: z.number().int().min(5).max(480).optional(),
      show_on_leaderboard: z.boolean().optional(),
      notification_preferences: z.object({ push: z.boolean(), email: z.boolean(), sms: z.boolean() }).optional(),
    }).parse(req.body);

    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined) {
        fields.push(`${k} = $${i}`);
        params.push(typeof v === "object" ? JSON.stringify(v) : v);
        i++;
      }
    }
    if (fields.length === 0) return reply.send({ success: true, data: { profile: null } });

    params.push(auth.sub);
    const result = await query(
      `UPDATE user_profiles SET ${fields.join(", ")}, updated_at = NOW()
       WHERE user_id = $${i}
       RETURNING *`,
      params
    );
    return reply.send({ success: true, data: { profile: result.rows[0] } });
  } catch (e) { handleErr(reply, e); }
});

app.post("/v1/devices/register", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const body = z.object({
      device_token: z.string(),
      platform: z.enum(["ios", "android", "web"]),
      device_model: z.string().optional(),
      os_version: z.string().optional(),
      app_version: z.string().optional(),
    }).parse(req.body);

    await query(
      `INSERT INTO user_devices (user_id, device_token, platform, device_model, os_version, app_version)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (platform, device_token) DO UPDATE
         SET user_id = EXCLUDED.user_id, last_seen_at = NOW(), is_active = true`,
      [auth.sub, body.device_token, body.platform, body.device_model ?? null, body.os_version ?? null, body.app_version ?? null]
    );
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
logger.info({ port: PORT }, "👤 user-service listening");
