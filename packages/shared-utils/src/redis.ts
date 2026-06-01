// Redis client
import Redis from "ioredis";
import { getConfig } from "./config.js";
import { logger } from "./logger.js";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;
  const config = getConfig();

  client = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    enableReadyCheck: true,
    lazyConnect: false,
  });

  client.on("error", (err) => logger.error({ err }, "Redis error"));
  client.on("connect", () => logger.info("Redis connected"));

  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const pong = await getRedis().ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}

// Convenience helpers
export const redisHelpers = {
  async getJSON<T>(key: string): Promise<T | null> {
    const val = await getRedis().get(key);
    return val ? (JSON.parse(val) as T) : null;
  },
  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await getRedis().set(key, serialized, "EX", ttlSeconds);
    } else {
      await getRedis().set(key, serialized);
    }
  },
  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return getRedis().del(...keys);
  },
  async incrWithExpiry(key: string, ttlSeconds: number): Promise<number> {
    const multi = getRedis().multi();
    multi.incr(key);
    multi.expire(key, ttlSeconds);
    const results = await multi.exec();
    return (results?.[0]?.[1] as number) ?? 0;
  },
};
