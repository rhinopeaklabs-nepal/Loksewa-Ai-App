// Configuration loader with validation
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SERVICE_NAME: z.string().min(1),
  SERVICE_PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  // Postgres
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_USER: z.string().default("loksewa"),
  POSTGRES_PASSWORD: z.string().default("loksewa_dev_pw"),
  POSTGRES_DB: z.string().default("loksewa_ai"),

  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Qdrant
  QDRANT_URL: z.string().default("http://localhost:6333"),
  QDRANT_API_KEY: z.string().optional(),

  // Kafka
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_CLIENT_ID: z.string().optional(),

  // Auth
  JWT_SECRET: z.string().min(16).default("dev-secret-change-in-production-please"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),

  // AI / LLM
  LLM_PROVIDER: z.enum(["qwen", "openai", "anthropic", "ollama"]).default("qwen"),
  LLM_BASE_URL: z.string().default("http://localhost:11434"),
  LLM_API_KEY: z.string().optional(),
  LLM_DEFAULT_MODEL: z.string().default("qwen2.5:7b"),
  EMBEDDING_MODEL: z.string().default("BAAI/bge-m3"),
  EMBEDDING_DIM: z.coerce.number().int().positive().default(1024),

  // S3 / MinIO
  S3_ENDPOINT: z.string().default("http://localhost:9000"),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().default("loksewa"),
  S3_SECRET_KEY: z.string().default("loksewa_dev_pw"),
  S3_BUCKET_DOCUMENTS: z.string().default("loksewa-ai-documents"),
  S3_BUCKET_TRAINING: z.string().default("loksewa-ai-training-data"),

  // Observability
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  ENABLE_TRACING: z.coerce.boolean().default(false),

  // Feature flags
  ENABLE_AI_TUTOR: z.coerce.boolean().default(true),
  ENABLE_MEMORY_ENGINE: z.coerce.boolean().default(true),
  ENABLE_GAMIFICATION: z.coerce.boolean().default(true),
});

export type Env = z.infer<typeof envSchema>;

let cachedConfig: Env | null = null;

export function loadConfig(serviceName: string): Env {
  if (cachedConfig) return cachedConfig;

  process.env.SERVICE_NAME = process.env.SERVICE_NAME || serviceName;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  cachedConfig = result.data;
  return cachedConfig;
}

export function getConfig(): Env {
  if (!cachedConfig) {
    throw new Error("Config not loaded. Call loadConfig() first.");
  }
  return cachedConfig;
}
