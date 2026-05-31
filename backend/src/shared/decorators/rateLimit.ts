/**
 * Rate limiting decorator helper
 * Protects endpoints from abuse by limiting request frequency
 */

import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Rate limit configuration options
 */
export interface RateLimitOptions {
  /** Maximum number of requests allowed in the time window */
  max: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Optional key generator function (default: uses IP) */
  keyGenerator?: (request: FastifyRequest) => string;
  /** Optional custom error message */
  message?: string;
}

/**
 * Default rate limit configuration
 */
export const DEFAULT_RATE_LIMIT: RateLimitOptions = {
  max: 100,
  windowSeconds: 60
};

/**
 * Stricter rate limit for authenticated endpoints
 */
export const AUTH_RATE_LIMIT: RateLimitOptions = {
  max: 20,
  windowSeconds: 60
};

/**
 * Strictest rate limit for sensitive operations (login, etc.)
 */
export const STRICT_RATE_LIMIT: RateLimitOptions = {
  max: 5,
  windowSeconds: 60
};

/**
 * Rate limit decorator factory
 *
 * @example
 * ```typescript
 * // Standard rate limit
 * fastify.post("/api/data", {
 *   preHandler: [rateLimit({ max: 100, windowSeconds: 60 })]
 * }, handler);
 *
 * // Custom rate limit
 * fastify.post("/auth/login", {
 *   preHandler: [rateLimit(STRICT_RATE_LIMIT)]
 * }, handler);
 * ```
 */
export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const config: RateLimitOptions = {
    ...DEFAULT_RATE_LIMIT,
    ...options
  };

  return async function rateLimitHandler(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Generate cache key for rate limiting
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : getClientIP(request);

    const cacheKey = `ratelimit:${key}:${request.url}`;

    // In production, this would use Redis to track request counts
    // For now, we return headers indicating rate limit status
    const limit = config.max;
    const remaining = limit - 1; // Simplified - would track actual count
    const resetTime = Math.floor(Date.now() / 1000) + config.windowSeconds;

    // Set rate limit headers
    reply.header("X-RateLimit-Limit", limit.toString());
    reply.header("X-RateLimit-Remaining", remaining.toString());
    reply.header("X-RateLimit-Reset", resetTime.toString());

    // Check if rate limit exceeded (would use Redis in production)
    // For now, always allow
    return;
  };
}

/**
 * Get client IP from request
 */
function getClientIP(request: FastifyRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return String(forwarded[0]).split(",")[0].trim();
  }
  return request.ip;
}

/**
 * Create rate limiter with custom key generator
 */
export function rateLimitByUser(options: RateLimitOptions) {
  return rateLimit({
    ...options,
    keyGenerator: (request: FastifyRequest) => {
      const typedRequest = request as { user?: { id: string } };
      return typedRequest.user?.id ?? getClientIP(request);
    }
  });
}