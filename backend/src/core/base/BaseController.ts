import { FastifyRequest, FastifyReply } from "fastify";
import { HttpStatus } from "../constants/HttpStatus";

/**
 * API response wrapper for consistent response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

/**
 * Error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Response metadata for pagination
 */
export interface ResponseMeta {
  timestamp?: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Base controller class providing request/response helpers.
 * All domain controllers should extend this class.
 */
export abstract class BaseController {
  /**
   * Create a success response with data
   */
  protected ok<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
    return {
      success: true,
      data,
      meta
    };
  }

  /**
   * Create a created response (201)
   */
  protected created<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
    return {
      success: true,
      data,
      meta
    };
  }

  /**
   * Create an error response
   */
  protected fail(code: string, message: string, details?: Record<string, unknown>): ApiError {
    return { code, message, details };
  }

  /**
   * Send a success response
   */
  protected sendOk<T>(
    reply: FastifyReply,
    data: T,
    statusCode = HttpStatus.OK,
    meta?: ResponseMeta
  ): FastifyReply {
    return reply.status(statusCode).send(this.ok(data, meta));
  }

  /**
   * Send a created response
   */
  protected sendCreated<T>(
    reply: FastifyReply,
    data: T,
    meta?: ResponseMeta
  ): FastifyReply {
    return reply.status(HttpStatus.CREATED).send(this.created(data, meta));
  }

  /**
   * Send an error response
   */
  protected sendError(
    reply: FastifyReply,
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ): FastifyReply {
    return reply.status(statusCode).send({
      success: false,
      error: this.fail(code, message, details)
    });
  }

  /**
   * Send a not found response
   */
  protected sendNotFound(reply: FastifyReply, message = "Resource not found"): FastifyReply {
    return this.sendError(reply, HttpStatus.NOT_FOUND, "NOT_FOUND", message);
  }

  /**
   * Send a bad request response
   */
  protected sendBadRequest(
    reply: FastifyReply,
    message = "Bad request",
    details?: Record<string, unknown>
  ): FastifyReply {
    return this.sendError(reply, HttpStatus.BAD_REQUEST, "BAD_REQUEST", message, details);
  }

  /**
   * Send an unauthorized response
   */
  protected sendUnauthorized(reply: FastifyReply, message = "Unauthorized"): FastifyReply {
    return this.sendError(reply, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
  }

  /**
   * Extract request ID from headers or generate one
   */
  protected getRequestId(request: FastifyRequest): string {
    return request.id as string || `req-${Date.now()}`;
  }

  /**
   * Build pagination metadata
   */
  protected buildPaginationMeta(
    page: number,
    limit: number,
    total: number
  ): ResponseMeta["pagination"] {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
}