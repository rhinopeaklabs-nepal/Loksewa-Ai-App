// Common error types
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly messageNe?: string;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    options: { details?: Record<string, unknown>; messageNe?: string; cause?: unknown } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = options.details;
    this.messageNe = options.messageNe;
    if (options.cause) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      message_ne: this.messageNe,
      details: this.details,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 400, { details, messageNe: "अमान्य डाटा।" });
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super("UNAUTHORIZED", message, 401, { messageNe: "कृपया लगइन गर्नुहोस्।" });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super("FORBIDDEN", message, 403, { messageNe: "पहुँच अस्वीकृत।" });
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super("NOT_FOUND", `${resource} not found`, 404, { messageNe: "फेला परेन।" });
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("CONFLICT", message, 409, { details });
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super("RATE_LIMIT_EXCEEDED", message, 429, { messageNe: "धेरै अनुरोध।" });
    this.name = "RateLimitError";
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super("SERVICE_UNAVAILABLE", `${service} is temporarily unavailable`, 503);
    this.name = "ServiceUnavailableError";
  }
}

export class AISafetyError extends AppError {
  constructor(reason: string) {
    super("AI_SAFETY", "I can't help with that request", 400, {
      details: { reason },
      messageNe: "म यो अनुरोधमा सहयोग गर्न सक्दिनँ।",
    });
    this.name = "AISafetyError";
  }
}
