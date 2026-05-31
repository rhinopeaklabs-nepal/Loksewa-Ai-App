import { FastifyRequest, FastifyReply, FastifyError } from "fastify";
import { HttpStatus } from "../constants/HttpStatus";
import { ErrorCodes } from "../constants/ErrorCodes";
import { AppError, isAppError } from "../errors/AppError";

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  /** Whether to include stack traces in development */
  includeStackTrace?: boolean;
  /** Custom error serializer */
  serializer?: (error: Error) => ErrorResponse;
  /** Hook called before sending error response */
  beforeSend?: (error: Error, reply: FastifyReply) => void;
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
  requestId?: string;
}

/**
 * Global error handler middleware for Fastify
 */
export class GlobalErrorHandler {
  private config: Required<ErrorHandlerConfig>;

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      includeStackTrace: config.includeStackTrace ?? process.env.NODE_ENV !== "production",
      serializer: config.serializer,
      beforeSend: config.beforeSend
    };
  }

  /**
   * Handle errors and send appropriate responses
   */
  async handle(
    error: Error | FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Call beforeSend hook if provided
    if (this.config.beforeSend) {
      this.config.beforeSend(error, reply);
    }

    // Handle AppError instances
    if (isAppError(error)) {
      return this.handleAppError(error, request, reply);
    }

    // Handle Fastify errors
    if ("statusCode" in error) {
      return this.handleFastifyError(error as FastifyError, request, reply);
    }

    // Handle unknown errors
    return this.handleUnknownError(error, request, reply);
  }

  /**
   * Handle AppError instances
   */
  private handleAppError(
    error: AppError,
    request: FastifyRequest,
    reply: FastifyReply
  ): void {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      timestamp: new Date().toISOString(),
      requestId: request.id as string
    };

    reply.status(error.statusCode).send(response);
  }

  /**
   * Handle Fastify errors
   */
  private handleFastifyError(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ): void {
    const statusCode = error.statusCode || 500;
    const code = this.mapStatusToErrorCode(statusCode);

    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message: statusCode >= 500 ? "Internal server error" : error.message,
        ...(this.config.includeStackTrace && error.stack ? { stack: error.stack } : {})
      },
      timestamp: new Date().toISOString(),
      requestId: request.id as string
    };

    reply.status(statusCode).send(response);
  }

  /**
   * Handle unknown/uncaught errors
   */
  private handleUnknownError(
    error: Error,
    request: FastifyRequest,
    reply: FastifyReply
  ): void {
    // Log the error
    console.error("Unhandled error:", {
      message: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      requestId: request.id
    });

    const response: ErrorResponse = {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: this.config.includeStackTrace ? error.message : "An unexpected error occurred"
      },
      timestamp: new Date().toISOString(),
      requestId: request.id as string
    };

    reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response);
  }

  /**
   * Map HTTP status code to error code
   */
  private mapStatusToErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return ErrorCodes.VALIDATION_ERROR;
      case 401:
        return ErrorCodes.UNAUTHORIZED;
      case 403:
        return ErrorCodes.FORBIDDEN;
      case 404:
        return ErrorCodes.NOT_FOUND;
      case 409:
        return ErrorCodes.CONFLICT;
      case 429:
        return ErrorCodes.RATE_LIMITED;
      default:
        return ErrorCodes.INTERNAL_ERROR;
    }
  }

  /**
   * Create Fastify error handler plugin
   */
  plugin() {
    return async (error: Error | FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      await this.handle(error, request, reply);
    };
  }
}

/**
 * Default error handler instance
 */
export const defaultErrorHandler = new GlobalErrorHandler();

/**
 * Create custom error handler with config
 */
export function createErrorHandler(config: ErrorHandlerConfig): GlobalErrorHandler {
  return new GlobalErrorHandler(config);
}

/**
 * Set custom error handler for Fastify
 */
export function setErrorHandler(app: { setErrorHandler: (fn: (err: Error, req: FastifyRequest, reply: FastifyReply) => Promise<void>) => void }): void {
  app.setErrorHandler(defaultErrorHandler.plugin());
}

/**
 * Not found handler for undefined routes
 */
export function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply
): void {
  reply.status(HttpStatus.NOT_FOUND).send({
    success: false,
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: `Route ${request.method} ${request.url} not found`
    },
    timestamp: new Date().toISOString(),
    requestId: request.id as string
  });
}

/**
 * Validation error handler
 */
export function validationErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  reply.status(HttpStatus.BAD_REQUEST).send({
    success: false,
    error: {
      code: ErrorCodes.VALIDATION_ERROR,
      message: "Validation failed",
      details: error.validation
    },
    timestamp: new Date().toISOString(),
    requestId: request.id as string
  });
}