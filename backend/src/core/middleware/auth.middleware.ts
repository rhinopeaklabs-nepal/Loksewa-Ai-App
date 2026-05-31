import { FastifyRequest, FastifyReply } from "fastify";
import { HttpStatus } from "../constants/HttpStatus";
import { UnauthorizedError, ForbiddenError } from "../errors/UnauthorizedError";

/**
 * JWT payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Authenticated request with user context
 */
export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

/**
 * Role-based access check function
 */
type RoleChecker = (roles: string[]) => boolean;

/**
 * Authentication middleware for Fastify
 * Validates JWT token and attaches user to request
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Get authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedError("Authorization header is required");
    }

    // Check Bearer token format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      throw new UnauthorizedError("Invalid authorization header format. Use: Bearer <token>");
    }

    const token = parts[1];
    
    // Verify token using Fastify JWT
    const decoded = await request.jwtVerify<JwtPayload>();
    
    // Attach user to request
    (request as AuthenticatedRequest).user = decoded;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      reply.status(HttpStatus.UNAUTHORIZED).send({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
      return;
    }

    // Handle JWT errors
    const err = error as Error;
    if (err.name === "TokenExpiredError") {
      reply.status(HttpStatus.UNAUTHORIZED).send({
        success: false,
        error: {
          code: "AUTH_TOKEN_EXPIRED",
          message: "Authentication token has expired"
        }
      });
      return;
    }

    if (err.name === "JsonWebTokenError") {
      reply.status(HttpStatus.UNAUTHORIZED).send({
        success: false,
        error: {
          code: "AUTH_TOKEN_INVALID",
          message: "Invalid authentication token"
        }
      });
      return;
    }

    throw error;
  }
}

/**
 * Create optional authentication middleware
 * Doesn't fail if no token is provided
 */
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return;
  }

  try {
    const decoded = await request.jwtVerify<JwtPayload>();
    (request as AuthenticatedRequest).user = decoded;
  } catch {
    // Silently ignore token errors for optional auth
  }
}

/**
 * Create role-based authorization middleware
 * @param allowedRoles - Array of roles that are allowed access
 */
export function authorizeRoles(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authRequest = request as AuthenticatedRequest;
    
    if (!authRequest.user) {
      reply.status(HttpStatus.UNAUTHORIZED).send({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required"
        }
      });
      return;
    }

    const userRole = authRequest.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      reply.status(HttpStatus.FORBIDDEN).send({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You don't have permission to access this resource"
        }
      });
      return;
    }
  };
}

/**
 * Create permission-based authorization middleware
 * @param permission - Required permission string
 */
export function requirePermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authRequest = request as AuthenticatedRequest;
    
    if (!authRequest.user) {
      reply.status(HttpStatus.UNAUTHORIZED).send({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required"
        }
      });
      return;
    }

    // For now, use role-based check
    // In a real app, you'd check against permissions database
    const rolePermissions: Record<string, string[]> = {
      admin: ["*"],
      moderator: ["read", "write", "moderate"],
      user: ["read", "write"],
      guest: ["read"]
    };

    const userPermissions = rolePermissions[authRequest.user.role] || [];
    
    if (!userPermissions.includes("*") && !userPermissions.includes(permission)) {
      reply.status(HttpStatus.FORBIDDEN).send({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Permission '${permission}' required`
        }
      });
      return;
    }
  };
}

/**
 * Premium subscription check middleware
 */
export async function requirePremium(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authRequest = request as AuthenticatedRequest;
  
  if (!authRequest.user) {
    reply.status(HttpStatus.UNAUTHORIZED).send({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required"
      }
    });
    return;
  }

  // Check subscription status
  // This would typically be a database lookup
  const isPremium = authRequest.user.role === "admin" || authRequest.user.role === "premium";
  
  if (!isPremium) {
    reply.status(HttpStatus.FORBIDDEN).send({
      success: false,
      error: {
        code: "FORBIDDEN_PREMIUM_REQUIRED",
        message: "Premium subscription required to access this feature"
      }
    });
  }
}

/**
 * Extract user from authenticated request
 */
export function getAuthenticatedUser(request: FastifyRequest): JwtPayload {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    throw new UnauthorizedError("User not authenticated");
  }
  return authRequest.user;
}