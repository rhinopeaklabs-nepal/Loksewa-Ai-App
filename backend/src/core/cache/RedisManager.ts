import Redis, { type RedisOptions } from "ioredis";
import { logger } from "../utils/logger";

export class RedisManager {
  private readonly client: Redis;

  constructor(options?: RedisOptions) {
    this.client = new Redis({
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB ?? 0),
      lazyConnect: true,
      maxRetriesPerRequest: null,
      ...options
    });
  }

  async connect(): Promise<void> {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
    logger.info("Redis connected");
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, value, "EX", ttlSeconds);
      return;
    }
    await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export const redisManager = new RedisManager();
