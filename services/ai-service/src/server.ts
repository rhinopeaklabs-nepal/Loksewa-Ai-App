// AI Service — Server entry
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { logger, loadConfig, checkHealth, closePool, closeKafka } from "@loksewa/shared-utils";
import { registerRoutes } from "./routes/index.js";
import { ensureCollections } from "./rag/retriever.js";

loadConfig("ai-service");
const PORT = Number(process.env.SERVICE_PORT) || 3006;

async function buildServer() {
  const app = Fastify({ logger, trustProxy: true });

  await app.register(helmet);
  await app.register(cors, { origin: true, credentials: true });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  app.get("/healthz", async () => ({ status: "ok", service: "ai-service" }));
  app.get("/readyz", async () => ({ status: (await checkHealth()) ? "ready" : "not_ready" }));

  await registerRoutes(app);
  return app;
}

async function main() {
  // Initialize Qdrant collections
  try {
    await ensureCollections();
    logger.info("Qdrant collections ready");
  } catch (err) {
    logger.warn({ err }, "Qdrant not ready yet — will retry on first use");
  }

  const app = await buildServer();

  const shutdown = async (sig: string) => {
    logger.info({ sig }, "Shutting down");
    await app.close();
    await closePool();
    await closeKafka();
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info({ port: PORT }, "🧠 ai-service listening");
}

main();
