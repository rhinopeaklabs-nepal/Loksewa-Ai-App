import { FastifyRequest, FastifyReply } from "fastify";
import { HttpStatus } from "../constants/HttpStatus";
import { ErrorCodes } from "../constants/ErrorCodes";
import { RedisManager } from "../cache/RedisManager";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  max: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Custom key generator function */
  keyGenerator?: (request: FastifyRequest) => string;
  /** Error message when rate limited */
  message?: string;
}

/**
 * Default rate limit configurations
 */
export const DefaultRateLimits = {
  // Strict limit for authentication endpoints
  AUTH: {
    max: 5,
    windowSeconds: 60,
    message: "Too many login attempts. Please try again later."
  },
  // Default API limit
  API: {
    max: 100,
    windowSeconds: 60,
    message: "Too many requests. Please slow down."
  },
  // Stricter limit for expensive operations
  WRITE: {
    max: 30,
    windowSeconds: 60,
    message: "Too many write operations. Please slow down."
  },
  // Very strict limit for AI endpoints (expensive)
  AI: {
    max: 10,
    windowSeconds: 60,
    message: "AI request limit exceeded. Please wait before making more requests."
  },
  // Upload limit
  UPLOAD: {
    max: 20,
    windowSeconds: 300,
    message: "Upload limit exceeded. Please try again later."
  },
  // Search limit
  SEARCH: {
    max: 50,
    windowSeconds: 60,
    message: "Search limit exceeded. Please wait."
  }
} as const;

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Reset time in seconds */
  resetIn: number;
  /** Total limit */
  limit: number;
}

/**
 * Rate limiting middleware
 * Uses Redis to track request counts
 */
export class RateLimitMiddleware {
  private redis: RedisManager;
  private defaultConfig: RateLimitConfig;

  constructor(redis: RedisManager, defaultConfig?: Partial<RateLimitConfig>) {
    this.redis = redis;
    this.defaultConfig = {
      max: defaultConfig?.max ?? 100,
      windowSeconds: defaultConfig?.windowSeconds ?? 60,
      keyGenerator: defaultConfig?.keyGenerator ?? this.defaultKeyGenerator,
      message: defaultConfig?.message ?? "Too many requests"
    };
  }

  /**
   * Default key generator uses IP address
   */
  private defaultKeyGenerator(request: FastifyRequest): string {
    return `ratelimit:${request.ip}`;
  }

  /**
   * Create a rate limit middleware with specific config
   */
  limit(config: RateLimitConfig) {
    const mergedConfig = { ...this.defaultConfig, ...config };
    
    return async (request: FastifyRequest, reply: FastifyReply): Promise<RateLimitResult> => {
      const key = mergedConfig.keyGenerator!(request);
      const result = await this.checkRateLimit(key, mergedConfig.max, mergedConfig.windowSeconds);

      // Set rate limit headers
      reply.header("X-RateLimit-Limit", result.limit);
      reply.header("X-RateLimit-Remaining", result.remaining);
      reply.header("X-RateLimit-Reset", result.resetIn);

      if (!result.allowed) {
        reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMITED,
            message: mergedConfig.message,
            retryAfter: result.resetIn
          }
        });
      }

      return result;
    };
  }

  /**
   * Check rate limit for a key
   */
  private async checkRateLimit(
    key: string,
    max: number,
    windowSeconds: number
  ): Promise<RateLimitResult> {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `${key}:${Math.floor(now / windowSeconds)}`;
    
    try {
      // Increment counter
      const count = await this.redis.increment(windowKey);
      
      // Set expiry if new key
      if (count === 1) {
        await this.redis.expire(windowKey, windowSeconds);
      }

      const remaining = Math.max(0, max - count);
      const resetIn = windowSeconds - (now % windowSeconds);

      return {
        allowed: count <= max,
        remaining,
        resetIn,
        limit: max
      };
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      console.error("Rate limit check failed:", error);
      return {
        allowed: true,
        remaining: max,
        resetIn: windowSeconds,
        limit: max
      };
    }
  }

  /**
   * Create auth-specific rate limit middleware
   */
  authLimit() {
    return this.limit(DefaultRateLimits.AUTH);
  }

  /**
   * Create API rate limit middleware
   */
  apiLimit() {
    return this.limit(DefaultRateLimits.API);
  }

  /**
   * Create write operation rate limit middleware
   */
  writeLimit() {
    return this.limit(DefaultRateLimits.WRITE);
  }

  /**
   * Create AI endpoint rate limit middleware
   */
  aiLimit() {
    return this.limit(DefaultRateLimits.AI);
  }
}

/**
 * Create rate limit middleware instance
 */
export function createRateLimitMiddleware(redis: RedisManager): RateLimitMiddleware {
  return new RateLimitMiddleware(redis);
}

/**
 * Built-in rate limit decorators for Fastify
 */
export const rateLimitDecorators = {
  /**
   * Apply default API rate limit
   */
  fastifyRateLimit: (max: number, windowSeconds: number) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const key = `ratelimit:api:${request.ip}`;
      const count = await redisClient.incr(key);
      
      if (count === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (count > max) {
        reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMITED,
            message: "Too many requests. Please slow down."
          }
        });
        return;
      }

      reply.header("X-RateLimit-Limit", max);
      reply.header("X-RateLimit-Remaining", Math.max(0, max - count));
    };
  }
};

// Global redis client for decorators
let redisClient: RedisManager | null = null;

export function setRedisClient(client: RedisManager): void {
  redisClient = client;
}