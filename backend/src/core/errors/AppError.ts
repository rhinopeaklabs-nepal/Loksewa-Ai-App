import { HttpStatus } from "../constants/HttpStatus";
import { ErrorCodes, type ErrorCode } from "../constants/ErrorCodes";

/**
 * Custom Application Error class
 * Provides structured error handling with status codes and error codes
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a copy of the error with modified properties
   */
  withDetails(details: Record<string, unknown>): AppError {
    return new AppError(this.message, this.statusCode, this.code, {
      ...this.details,
      ...details
    });
  }

  /**
   * Convert error to JSON object
   */
  toJSON(): ErrorResponse {
    return {
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      details: this.details
    };
  }

  /**
   * Create from another error
   */
  static from(error: Error, statusCode = 500, code = ErrorCodes.INTERNAL_ERROR): AppError {
    const appError = new AppError(error.message, statusCode, code);
    if (error.stack) {
      appError.stack = error.stack;
    }
    return appError;
  }
}

/**
 * Error response structure for API
 */
export interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Check if an error is operational (expected) vs programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}