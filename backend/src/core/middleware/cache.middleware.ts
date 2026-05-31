import { FastifyRequest, FastifyReply } from "fastify";
import { RedisManager } from "../cache/RedisManager";
import { CacheKeys } from "../cache/CacheKeys";

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Cache key generator function */
  keyGenerator?: (request: FastifyRequest) => string;
  /** Time to live in seconds */
  ttl?: number;
  /** Whether to cache POST requests */
  cachePostRequests?: boolean;
  /** Custom condition to check before caching */
  shouldCache?: (request: FastifyRequest) => boolean;
  /** Callback when cache hit occurs */
  onCacheHit?: (request: FastifyRequest, data: unknown) => void;
  /** Callback when cache miss occurs */
  onCacheMiss?: (request: FastifyRequest) => void;
}

/**
 * Cache middleware for response caching
 */
export class CacheMiddleware {
  private redis: RedisManager;
  private defaultTtl: number;

  constructor(redis: RedisManager, defaultTtl = 300) {
    this.redis = redis;
    this.defaultTtl = defaultTtl;
  }

  /**
   * Create a caching middleware for a specific route
   */
  cache(options: CacheOptions = {}) {
    const {
      keyGenerator = this.defaultKeyGenerator,
      ttl = this.defaultTtl,
      cachePostRequests = false,
      shouldCache = () => true,
      onCacheHit,
      onCacheMiss
    } = options;

    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      // Skip POST requests unless configured
      if (request.method === "POST" && !cachePostRequests) {
        return;
      }

      // Check if request should be cached
      if (!shouldCache(request)) {
        return;
      }

      // Generate cache key
      const cacheKey = keyGenerator(request);

      try {
        // Try to get from cache
        const cachedData = await this.redis.get(cacheKey);

        if (cachedData) {
          // Cache hit
          if (onCacheHit) {
            onCacheHit(request, JSON.parse(cachedData));
          }

          reply.header("X-Cache", "HIT");
          reply.send(JSON.parse(cachedData));
          return;
        }

        // Cache miss - store original send function
        if (onCacheMiss) {
          onCacheMiss(request);
        }

        reply.header("X-Cache", "MISS");

        // Hook into reply to cache the response
        const originalSend = reply.send.bind(reply);
        
        reply.send = (data: unknown): FastifyReply => {
          // Cache the response
          this.redis.set(cacheKey, JSON.stringify(data), ttl).catch(err => {
            console.error("Failed to cache response:", err);
          });
          
          return originalSend(data);
        };
      } catch (error) {
        console.error("Cache middleware error:", error);
        // Continue without caching on error
      }
    };
  }

  /**
   * Default cache key generator
   */
  private defaultKeyGenerator(request: FastifyRequest): string {
    return `cache:${request.method}:${request.url}`;
  }

  /**
   * Create a cached endpoint for specific resources
   */
  cachedEndpoint(resourceType: string, ttl = 300) {
    return async (
      request: FastifyRequest,
      reply: FastifyReply,
      resourceId?: string
    ): Promise<void> => {
      const id = resourceId || (request.params as { id?: string }).id;
      if (!id) return;

      const cacheKey = CacheKeys[resourceType] 
        ? (CacheKeys as Record<string, (id: string) => string>)[resourceType]?.(id)
        : `cache:${resourceType}:${id}`;

      if (!cacheKey) return;

      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          reply.header("X-Cache", "HIT");
          reply.send(JSON.parse(cached));
          return;
        }

        reply.header("X-Cache", "MISS");
      } catch (error) {
        console.error("Cached endpoint error:", error);
      }
    };
  }

  /**
   * Invalidate cache for a specific key pattern
   */
  async invalidate(pattern: string): Promise<number> {
    try {
      return await this.redis.del(pattern);
    } catch (error) {
      console.error("Cache invalidation error:", error);
      return 0;
    }
  }

  /**
   * Invalidate cache for a specific resource
   */
  async invalidateResource(resourceType: string, resourceId: string): Promise<void> {
    const cacheKeyFn = (CacheKeys as Record<string, (id: string) => string>)[resourceType];
    if (cacheKeyFn) {
      await this.invalidate(cacheKeyFn(resourceId));
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      await this.redis.flush();
    } catch (error) {
      console.error("Clear all cache error:", error);
    }
  }
}

/**
 * Create cache middleware instance
 */
export function createCacheMiddleware(redis: RedisManager, defaultTtl = 300): CacheMiddleware {
  return new CacheMiddleware(redis, defaultTtl);
}

/**
 * Pre-built cache configurations
 */
export const CacheConfigs = {
  // Cache for 5 minutes - good for lists
  SHORT: { ttl: 300 },
  // Cache for 15 minutes - good for individual resources
  MEDIUM: { ttl: 900 },
  // Cache for 1 hour - good for rarely changing data
  LONG: { ttl: 3600 },
  // Cache for 24 hours - good for reference data
  DAY: { ttl: 86400 },
  // Don't cache
  NONE: { ttl: 0 }
} as const;

/**
 * Cache user-specific data (short TTL)
 */
export function cacheUserData(redis: RedisManager, userId: string, data: unknown, ttl = 300): Promise<void> {
  return redis.set(CacheKeys.userStats(userId), JSON.stringify(data), ttl);
}

/**
 * Get cached user data
 */
export async function getCachedUserData<T>(redis: RedisManager, userId: string): Promise<T | null> {
  const cached = await redis.get(CacheKeys.userStats(userId));
  if (cached) {
    return JSON.parse(cached) as T;
  }
  return null;
}

/**
 * Invalidate user cache
 */
export function invalidateUserCache(redis: RedisManager, userId: string): Promise<number> {
  return redis.del(CacheKeys.userStats(userId));
}

/**
 * Cache AI lesson
 */
export function cacheLesson(redis: RedisManager, questionId: string, lesson: unknown, ttl = 86400): Promise<void> {
  return redis.set(CacheKeys.aiLesson(questionId), JSON.stringify(lesson), ttl);
}

/**
 * Get cached AI lesson
 */
export async function getCachedLesson<T>(redis: RedisManager, questionId: string): Promise<T | null> {
  const cached = await redis.get(CacheKeys.aiLesson(questionId));
  if (cached) {
    return JSON.parse(cached) as T;
  }
  return null;
}