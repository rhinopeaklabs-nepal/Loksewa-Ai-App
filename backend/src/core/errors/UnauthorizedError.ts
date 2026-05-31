import { HttpStatus } from "../constants/HttpStatus";
import { ErrorCodes } from "../constants/ErrorCodes";
import { AppError, type ErrorResponse } from "./AppError";

/**
 * Unauthorized Error (401)
 * Used when authentication is required or has failed
 */
export class UnauthorizedError extends AppError {
  constructor(
    message = "Authentication required",
    code: "UNAUTHORIZED" | "AUTH_TOKEN_EXPIRED" | "AUTH_TOKEN_INVALID" = "UNAUTHORIZED",
    details?: Record<string, unknown>
  ) {
    const errorCode = code === "AUTH_TOKEN_EXPIRED" 
      ? ErrorCodes.AUTH_TOKEN_EXPIRED 
      : code === "AUTH_TOKEN_INVALID"
        ? ErrorCodes.AUTH_TOKEN_INVALID
        : ErrorCodes.UNAUTHORIZED;

    super(message, HttpStatus.UNAUTHORIZED, errorCode, details);
  }

  /**
   * Create for invalid credentials
   */
  static invalidCredentials(): UnauthorizedError {
    return new UnauthorizedError("Invalid email or password", "UNAUTHORIZED");
  }

  /**
   * Create for expired token
   */
  static tokenExpired(): UnauthorizedError {
    return new UnauthorizedError("Session has expired, please login again", "AUTH_TOKEN_EXPIRED");
  }

  /**
   * Create for invalid token
   */
  static invalidToken(): UnauthorizedError {
    return new UnauthorizedError("Invalid authentication token", "AUTH_TOKEN_INVALID");
  }

  /**
   * Convert to API error response
   */
  toResponse(): ErrorResponse {
    return this.toJSON();
  }
}

/**
 * Forbidden Error (403)
 * Used when the user doesn't have permission for an action
 */
export class ForbiddenError extends AppError {
  constructor(
    message = "Access denied",
    reason?: "PREMIUM_REQUIRED" | "SUBSCRIPTION_EXPIRED" | "INSUFFICIENT_PERMISSIONS",
    details?: Record<string, unknown>
  ) {
    const code = reason === "PREMIUM_REQUIRED"
      ? ErrorCodes.FORBIDDEN_PREMIUM_REQUIRED
      : reason === "SUBSCRIPTION_EXPIRED"
        ? ErrorCodes.FORBIDDEN_SUBSCRIPTION_EXPIRED
        : ErrorCodes.FORBIDDEN;

    super(message, HttpStatus.FORBIDDEN, code, details);
  }

  /**
   * Create when premium subscription is required
   */
  static premiumRequired(): ForbiddenError {
    return new ForbiddenError("Premium subscription required to access this feature", "PREMIUM_REQUIRED");
  }

  /**
   * Create when subscription has expired
   */
  static subscriptionExpired(): ForbiddenError {
    return new ForbiddenError("Your subscription has expired", "SUBSCRIPTION_EXPIRED");
  }

  /**
   * Create when user lacks permissions
   */
  static insufficientPermissions(requiredPermission?: string): ForbiddenError {
    return new ForbiddenError(
      requiredPermission 
        ? `Permission '${requiredPermission}' required`
        : "You don't have permission to perform this action",
      "INSUFFICIENT_PERMISSIONS"
    );
  }

  /**
   * Convert to API error response
   */
  toResponse(): ErrorResponse {
    return this.toJSON();
  }
}

/**
 * Helper to throw unauthorized error
 */
export function requireAuth(): never {
  throw new UnauthorizedError();
}

/**
 * Helper to throw forbidden error
 */
export function requirePermission(permission: string): never {
  throw ForbiddenError.insufficientPermissions(permission);
}

/**
 * Helper to throw premium required error
 */
export function requirePremium(): never {
  throw ForbiddenError.premiumRequired();
}