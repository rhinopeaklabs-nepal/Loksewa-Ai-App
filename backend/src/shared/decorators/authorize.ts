/**
 * Role-based authorization decorator
 * Restricts access to routes based on user roles
 */

import type { FastifyRequest } from "fastify";
import { UserRole } from "../enums/UserRole";
import { AuthenticatedRequest } from "./authenticate";

/**
 * Authorization options
 */
export interface AuthorizeOptions {
  /** Allowed roles - user must have one of these roles */
  roles: UserRole[];
  /** If true, user must have ALL specified roles (default: false - any match) */
  requireAll?: boolean;
}

/**
 * Authorization decorator factory
 *
 * @example
 * ```typescript
 * // Require admin role
 * fastify.delete("/admin-only", {
 *   preHandler: [authorize({ roles: [UserRole.Admin] })]
 * }, handler);
 *
 * // Require either admin or moderator
 * fastify.delete("/mod-action", {
 *   preHandler: [authorize({ roles: [UserRole.Admin, UserRole.Moderator] })]
 * }, handler);
 * ```
 */
export function authorize(options: UserRole[] | AuthorizeOptions) {
  const authOptions: AuthorizeOptions = Array.isArray(options)
    ? { roles: options }
    : options;

  const { roles, requireAll = false } = authOptions;

  return async function authorizeHandler(
    request: FastifyRequest,
    reply: { status: (code: number) => { send: (data: unknown) => void } }
  ): Promise<void> {
    // Check if user is authenticated
    const typedRequest = request as AuthenticatedRequest;
    const user = typedRequest.user;

    if (!user) {
      reply.status(401).send({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required"
        }
      });
      return;
    }

    // Check role authorization
    const hasRole = requireAll
      ? roles.every((role) => user.role === role)
      : roles.includes(user.role);

    if (!hasRole) {
      reply.status(403).send({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions"
        }
      });
      return;
    }

    // User is authorized
    return;
  };
}

/**
 * Pre-configured authorization decorators for common role combinations
 */
export const authorizeAdmin = authorize({ roles: [UserRole.Admin] });
export const authorizeModerator = authorize({ roles: [UserRole.Admin, UserRole.Moderator] });
export const authorizeStudent = authorize({ roles: [UserRole.Admin, UserRole.Student] });

/**
 * Helper to check if current user has a specific role
 */
export function hasRole(request: FastifyRequest, role: UserRole): boolean {
  const typedRequest = request as AuthenticatedRequest;
  return typedRequest.user?.role === role;
}

/**
 * Helper to check if current user has any of the specified roles
 */
export function hasAnyRole(request: FastifyRequest, roles: UserRole[]): boolean {
  const typedRequest = request as AuthenticatedRequest;
  return typedRequest.user ? roles.includes(typedRequest.user.role) : false;
}