import "dotenv/config";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance } from "fastify";
import { redisManager } from "./core/cache/RedisManager";
import { dataSource } from "./core/database/DataSource";
import { errorHandlerMiddleware } from "./core/middleware/errorHandler.middleware";
import { rateLimitMiddleware } from "./core/middleware/rateLimit.middleware";
import { logger } from "./core/utils/logger";
import { AnalyticsController } from "./domains/analytics/controllers/AnalyticsController";
import { AnswerController } from "./domains/answers/controllers/AnswerController";
import { AuthController } from "./domains/auth/controllers/AuthController";
import { AuthService } from "./domains/auth/services/AuthService";
import { LearningController } from "./domains/learning/controllers/LearningController";
import { MockTestController } from "./domains/mock-test/controllers/MockTestController";
import { QuestionController } from "./domains/questions/controllers/QuestionController";
import { ScanController } from "./domains/scan/controllers/ScanController";
import { SubjectsController } from "./domains/subjects/controllers/SubjectsController";
import { SubscriptionController } from "./domains/subscription/controllers/SubscriptionController";
import { TutorController } from "./domains/ai-tutor/controllers/TutorController";
import { UserController } from "./domains/user/controllers/UserController";
import configPlugin, { config } from "./config";
import { registerRoutes } from "./routes";
import { workers } from "./workers";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: config.logLevel } });

  await app.register(configPlugin);
  await app.register(cors, {
    origin: config.corsOrigins,
    credentials: true
  });
  await app.register(jwt, {
    secret: config.jwtSecret
  });
  await rateLimitMiddleware(app);
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Loksewa AI Backend",
        version: "0.1.0"
      }
    }
  });
  await app.register(swaggerUi, {
    routePrefix: "/docs"
  });

  app.setErrorHandler(errorHandlerMiddleware);

  app.get("/healthz", async () => ({
    status: "ok",
    service: "loksewa-ai-backend",
    env: config.env,
    workers: workers.map((worker) => worker.name)
  }));

  await registerRoutes(app, {
    analyticsController: new AnalyticsController(),
    answerController: new AnswerController(),
    authController: new AuthController(new AuthService()),
    learningController: new LearningController(),
    mockTestController: new MockTestController(),
    questionController: new QuestionController(),
    scanController: new ScanController(),
    subjectsController: new SubjectsController(),
    subscriptionController: new SubscriptionController(),
    tutorController: new TutorController(),
    userController: new UserController()
  });

  app.addHook("onReady", async () => {
    await dataSource.connect();
    try {
      await redisManager.connect();
    } catch (error) {
      logger.warn({ error }, "Redis unavailable; continuing without cache/queue connectivity");
    }
  });

  app.addHook("onClose", async () => {
    await dataSource.disconnect();
    await redisManager.disconnect().catch((error: unknown) => {
      logger.warn({ error }, "Redis disconnect skipped");
    });
  });

  return app;
}

export async function startApp(): Promise<void> {
  const app = await buildApp();
  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    logger.info({ signal }, "Shutting down");
    await app.close();
    process.exit(0);
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);

  await app.listen({ host: config.host, port: config.port });
}
