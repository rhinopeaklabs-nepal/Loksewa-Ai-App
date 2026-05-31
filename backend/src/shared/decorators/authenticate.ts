/**
 * Authentication decorator for Fastify routes
 * Extends FastifyRequest with authenticated user information
 */

import type { FastifyRequest } from "fastify";
import { UserRole } from "../enums/UserRole";

/**
 * Authenticated user payload attached to request
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  subscriptionPlan?: string;
}

/**
 * Extended FastifyRequest with authenticated user
 */
export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser;
}

/**
 * Authentication decorator function
 * Use with Fastify route preHandler hook to protect routes
 *
 * @example
 * ```typescript
 * fastify.get("/protected", {
 *   preHandler: [authenticate()]
 * }, async (request, reply) => {
 *   const user = (request as AuthenticatedRequest).user;
 *   return { userId: user.id };
 * });
 * ```
 */
export function authenticate() {
  return async function authHandler(
    request: FastifyRequest,
    reply: { status: (code: number) => { send: (data: unknown) => void } }
  ): Promise<void> {
    try {
      // Verify JWT token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply.status(401).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Missing or invalid authorization header"
          }
        });
        return;
      }

      // In production, this would verify and decode the JWT
      // For now, we extract user from request headers (set by auth middleware)
      const user = (request as AuthenticatedRequest).user;
      if (!user) {
        reply.status(401).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired token"
          }
        });
        return;
      }

      // Attach user to request for route handlers
      (request as AuthenticatedRequest).user = user;
    } catch (err) {
      reply.status(401).send({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication failed"
        }
      });
    }
  };
}

/**
 * Type guard to check if request has authenticated user
 */
export function isAuthenticated(request: FastifyRequest): request is AuthenticatedRequest {
  return "user" in request && (request as AuthenticatedRequest).user !== undefined;
}

/**
 * Get current user from request (throws if not authenticated)
 */
export function requireAuth(request: FastifyRequest): AuthUser {
  if (!isAuthenticated(request)) {
    throw new Error("Authentication required");
  }
  return (request as AuthenticatedRequest).user;
}