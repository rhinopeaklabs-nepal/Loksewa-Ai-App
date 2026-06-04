// Content Service - Syllabus, lessons, and course content shell.
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { checkHealth, closePool, loadConfig, logger } from "@loksewa/shared-utils";

loadConfig("content-service");
const PORT = Number(process.env.SERVICE_PORT) || 3012;

const app = Fastify({ logger, trustProxy: true });
await app.register(helmet);
await app.register(cors, { origin: true, credentials: true });

app.get("/healthz", async () => ({ status: "ok", service: "content-service" }));
app.get("/readyz", async () => ({ status: (await checkHealth()) ? "ready" : "not_ready" }));

const shutdown = async () => {
  await app.close();
  await closePool();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

await app.listen({ port: PORT, host: "0.0.0.0" });
logger.info({ port: PORT }, "content-service listening");
