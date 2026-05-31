// Redis configuration from environment variables

export interface RedisConfig {
  url: string;
  keyPrefix: string;
  maxRetriesPerRequest: number | null;
  enableReadyCheck: boolean;
  retryStrategyMs: number;
}

function parseRedisUrl(): string {
  const host = process.env.REDIS_HOST ?? "localhost";
  const port = process.env.REDIS_PORT ?? "6379";
  const password = process.env.REDIS_PASSWORD;

  if (password) {
    return `redis://:${password}@${host}:${port}`;
  }
  return `redis://${host}:${port}`;
}

export function getRedisConfig(): RedisConfig {
  return {
    url: process.env.REDIS_URL ?? parseRedisUrl(),
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? "loksewa:",
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategyMs: 3000
  };
}

export const redisConfig = getRedisConfig();
export default redisConfig;