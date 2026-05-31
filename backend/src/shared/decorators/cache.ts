/**
 * Cache decorator helper
 * Provides caching capabilities for route responses
 */

import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Time-to-live in seconds */
  ttlSeconds: number;
  /** Cache key generator function */
  keyGenerator?: (request: FastifyRequest) => string;
  /** Whether to vary cache by query string */
  varyByQuery?: boolean;
  /** Whether to vary cache by user (for authenticated routes) */
  varyByUser?: boolean;
}

/**
 * Default cache TTL values
 */
export const CACHE_TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 3600,     // 1 hour
  DAY: 86400      // 24 hours
} as const;

/**
 * Cache key prefixes for different resource types
 */
export const CACHE_KEYS = {
  USER: "cache:user",
  SUBJECT: "cache:subject",
  QUESTION: "cache:question",
  LESSON: "cache:lesson",
  MOCK_TEST: "cache:mocktest"
} as const;

/**
 * Generate cache key for a request
 */
export function generateCacheKey(
  prefix: string,
  request: FastifyRequest,
  options?: Partial<CacheOptions>
): string {
  const parts = [prefix];

  if (options?.varyByQuery) {
    const queryString = JSON.stringify(request.query);
    parts.push(`q:${queryString}`);
  }

  if (options?.varyByUser) {
    const typedRequest = request as { user?: { id: string } };
    if (typedRequest.user?.id) {
      parts.push(`u:${typedRequest.user.id}`);
    }
  }

  return parts.join(":");
}

/**
 * Cache decorator factory
 *
 * @example
 * ```typescript
 * // Cache for 5 minutes
 * fastify.get("/api/subjects", {
 *   preHandler: [cache({ ttlSeconds: CACHE_TTL.MEDIUM })]
 * }, handler);
 *
 * // Cache with custom key generator
 * fastify.get("/api/questions/:id", {
 *   preHandler: [cache({
 *     ttlSeconds: CACHE_TTL.LONG,
 *     keyGenerator: (req) => `question:${req.params.id}`
 *   })]
 * }, handler);
 * ```
 */
export function cache(options: Partial<CacheOptions> = {}) {
  const config: CacheOptions = {
    ttlSeconds: CACHE_TTL.MEDIUM,
    varyByQuery: false,
    varyByUser: false,
    ...options
  };

  return async function cacheHandler(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Generate cache key
    const cacheKey = config.keyGenerator
      ? config.keyGenerator(request)
      : `${request.url}`;

    // In production, this would check Redis for cached response
    // Set cache headers for client-side caching awareness
    reply.header("Cache-Control", `private, max-age=${config.ttlSeconds}`);
    reply.header("X-Cache-TTL", config.ttlSeconds.toString());

    // Attach cache metadata to request for response handler
    const typedRequest = request as { cacheKey?: string; cacheTtl?: number };
    typedRequest.cacheKey = cacheKey;
    typedRequest.cacheTtl = config.ttlSeconds;

    return;
  };
}

/**
 * Create cache decorator with preset TTL
 */
export const cacheShort = cache({ ttlSeconds: CACHE_TTL.SHORT });
export const cacheMedium = cache({ ttlSeconds: CACHE_TTL.MEDIUM });
export const cacheLong = cache({ ttlSeconds: CACHE_TTL.LONG });

/**
 * Invalidate cache for a specific key pattern
 * In production, this would delete from Redis
 */
export async function invalidateCache(pattern: string): Promise<void> {
  // In production: await redisManager.deletePattern(`cache:${pattern}*`);
  console.log(`Cache invalidated for pattern: ${pattern}`);
}

/**
 * Clear all application cache
 */
export async function clearAllCache(): Promise<void> {
  // In production: await redisManager.flush();
  console.log("All cache cleared");
}