// Auth service Fastify server
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { logger, closePool, checkHealth } from "@loksewa/shared-utils";
import { registerRoutes } from "./routes/index.js";
import "./config.js";

const PORT = Number(process.env.SERVICE_PORT) || 3001;

async function buildServer() {
  const app = Fastify({
    logger: logger,
    trustProxy: true,
    disableRequestLogging: false,
  });

  // Plugins
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: process.env.CORS_ORIGINS?.split(",") ?? true,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Health
  app.get("/healthz", async () => ({ status: "ok", service: "auth-service" }));
  app.get("/readyz", async () => {
    const dbOk = await checkHealth();
    return { status: dbOk ? "ready" : "not_ready", db: dbOk };
  });

  // Routes
  await registerRoutes(app);

  return app;
}

async function main() {
  const app = await buildServer();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down auth-service");
    await app.close();
    await closePool();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    logger.info({ port: PORT }, "🔐 auth-service listening");
  } catch (err) {
    logger.error({ err }, "Failed to start");
    process.exit(1);
  }
}

main();
