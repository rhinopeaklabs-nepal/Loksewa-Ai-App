/**
 * Standard API response wrapper type
 * Provides consistent response structure across all endpoints
 */

/**
 * Error details for failed responses
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Response metadata
 */
export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Standard API response wrapper
 * @template T - The type of data being returned
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * Create a successful API response
 */
export function success<T>(data: T, meta?: Partial<ApiMeta>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Create an error API response
 */
export function error(code: string, message: string, details?: Record<string, unknown>): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  BAD_REQUEST: "BAD_REQUEST",
  CONFLICT: "CONFLICT"
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];