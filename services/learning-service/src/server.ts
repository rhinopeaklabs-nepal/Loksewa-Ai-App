// Learning service — Server entry
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { logger, loadConfig, checkHealth, closePool, publishEvent } from "@loksewa/shared-utils";
import { registerRoutes } from "./routes/index.js";
import { updateSkillScore } from "./engines/skillEngine.js";

loadConfig("learning-service");
const PORT = Number(process.env.SERVICE_PORT) || 3003;

async function buildServer() {
  const app = Fastify({ logger, trustProxy: true });

  await app.register(helmet);
  await app.register(cors, { origin: true, credentials: true });
  await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });

  app.get("/healthz", async () => ({ status: "ok", service: "learning-service" }));
  app.get("/readyz", async () => ({ status: (await checkHealth()) ? "ready" : "not_ready" }));

  await registerRoutes(app);
  return app;
}

async function main() {
  const app = await buildServer();

  const shutdown = async (sig: string) => {
    logger.info({ sig }, "Shutting down");
    await app.close();
    await closePool();
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info({ port: PORT }, "📚 learning-service listening");
}

main();
