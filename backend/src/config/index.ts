// Central configuration — reads from environment variables

export interface AppConfig {
  env: string;
  port: number;
  logLevel: string;
  corsOrigins: string[];
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  databaseUrl: string;
  redisUrl: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  ollamaUrl: string;
  s3Bucket: string;
  s3Region: string;
}

export const config: AppConfig = {
  env: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "8000", 10),
  logLevel: process.env.LOG_LEVEL ?? "info",
  corsOrigins: (process.env.CORS_ORIGINS ?? "*").split(",").map(s => s.trim()),
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  ollamaUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3Region: process.env.S3_REGION ?? "us-east-1"
};

export default config;