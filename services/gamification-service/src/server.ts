// Gamification service — Server with enhanced endpoints
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { logger, loadConfig, checkHealth, closePool, authenticate, AppError } from "@loksewa/shared-utils";
import { z } from "zod";
import {
  awardXP,
  getUserXP,
  recordActivity,
  getUserStreak,
  getUserBadges,
  getAvailableBadges,
  getLeaderboard,
  calculateXPForAnswer,
  checkAndAwardBadges,
  XP_RULES,
  getUserStats,
  getActiveChallenges,
  levelFromXP,
  BADGE_DEFINITIONS,
} from "./engines/xpEngine.js";

loadConfig("gamification-service");
const PORT = Number(process.env.SERVICE_PORT) || 3004;

const app = Fastify({ logger, trustProxy: true });
await app.register(helmet);
await app.register(cors, { origin: true, credentials: true });

app.get("/healthz", async () => ({ status: "ok", service: "gamification-service" }));
app.get("/readyz", async () => ({ status: (await checkHealth()) ? "ready" : "not_ready" }));

// XP
app.get("/v1/users/me/xp", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const xp = await getUserXP(auth.sub);
    return reply.send({ success: true, data: { xp } });
  } catch (e) { return handleErr(reply, e); }
});

app.post("/v1/users/me/xp/award", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const body = z.object({
      amount: z.number().int().positive().max(1000),
      source: z.string().min(1).max(50),
      source_id: z.string().uuid().optional(),
      description: z.string().max(200).optional(),
    }).parse(req.body);
    const xp = await awardXP(auth.sub, body.amount, body.source, body.source_id, body.description);
    const newBadges = await checkAndAwardBadges(auth.sub);
    return reply.send({ success: true, data: { xp, new_badges: newBadges } });
  } catch (e) { return handleErr(reply, e); }
});

// Streak
app.get("/v1/users/me/streak", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const streak = await getUserStreak(auth.sub);
    return reply.send({ success: true, data: { streak } });
  } catch (e) { return handleErr(reply, e); }
});

app.post("/v1/users/me/activity", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const body = z.object({
      use_freeze: z.boolean().default(false)
    }).parse(req.body ?? {});
    const streak = await recordActivity(auth.sub, body.use_freeze);
    return reply.send({ success: true, data: { streak } });
  } catch (e) { return handleErr(reply, e); }
});

// Badges
app.get("/v1/users/me/badges", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const badges = await getUserBadges(auth.sub);
    return reply.send({ success: true, data: { badges } });
  } catch (e) { return handleErr(reply, e); }
});

app.get("/v1/users/me/badges/available", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const badges = await getAvailableBadges(auth.sub);
    return reply.send({ success: true, data: { badges } });
  } catch (e) { return handleErr(reply, e); }
});

app.get("/v1/badges/catalog", async (req, reply) => {
  try {
    const catalog = Object.entries(BADGE_DEFINITIONS).map(([id, def]) => ({
      id,
      ...def
    }));
    return reply.send({ success: true, data: { badges: catalog } });
  } catch (e) { return handleErr(reply, e); }
});

// Leaderboard
app.get("/v1/leaderboards", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const q = z.object({
      scope: z.enum(["national", "district", "subject", "friends", "institution"]).default("national"),
      period: z.enum(["daily", "weekly", "monthly", "all_time"]).default("all_time"),
      scope_value: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(500).default(100),
    }).parse(req.query);
    const entries = await getLeaderboard(q.scope, q.period, q.scope_value, q.limit, auth.sub);
    return reply.send({ success: true, data: { entries, scope: q.scope, period: q.period } });
  } catch (e) { return handleErr(reply, e); }
});

// Challenges
app.get("/v1/users/me/challenges", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const challenges = await getActiveChallenges(auth.sub);
    return reply.send({ success: true, data: { challenges } });
  } catch (e) { return handleErr(reply, e); }
});

// Comprehensive stats
app.get("/v1/users/me/stats", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const stats = await getUserStats(auth.sub);
    return reply.send({ success: true, data: { stats } });
  } catch (e) { return handleErr(reply, e); }
});

// XP Rules (public endpoint)
app.get("/v1/xp-rules", async (req, reply) => {
  return reply.send({ success: true, data: { rules: XP_RULES } });
});

// Level calculation utility
app.get("/v1/level/:xp", async (req, reply) => {
  const { xp } = req.params as { xp: string };
  const totalXP = parseInt(xp, 10);
  if (isNaN(totalXP) || totalXP < 0) {
    return reply.status(400).send({ success: false, error: { code: "INVALID_XP" } });
  }
  const levelInfo = levelFromXP(totalXP);
  return reply.send({ success: true, data: levelInfo });
});

function handleErr(reply: any, err: unknown) {
  if (err instanceof AppError) return reply.status(err.statusCode).send({ success: false, error: err.toJSON() });
  if (err instanceof z.ZodError) return reply.status(400).send({ success: false, error: { code: "VALIDATION_ERROR" } });
  reply.log.error({ err }, "Unhandled");
  return reply.status(500).send({ success: false });
}

const shutdown = async () => {
  await app.close();
  await closePool();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

await app.listen({ port: PORT, host: "0.0.0.0" });
logger.info({ port: PORT }, "🏆 gamification-service listening");
