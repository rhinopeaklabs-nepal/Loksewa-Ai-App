/**
 * Application Error Codes
 * Standardized error codes for the Loksewa AI platform
 */
export const ErrorCodes = {
  // Authentication & Authorization
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_TOKEN_INVALID: "AUTH_TOKEN_INVALID",
  AUTH_REFRESH_FAILED: "AUTH_REFRESH_FAILED",
  AUTH_SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  AUTH_ACCOUNT_LOCKED: "AUTH_ACCOUNT_LOCKED",
  AUTH_ACCOUNT_DISABLED: "AUTH_ACCOUNT_DISABLED",
  AUTH_2FA_REQUIRED: "AUTH_2FA_REQUIRED",
  AUTH_2FA_INVALID: "AUTH_2FA_INVALID",

  // Authorization
  FORBIDDEN: "FORBIDDEN",
  FORBIDDEN_PREMIUM_REQUIRED: "FORBIDDEN_PREMIUM_REQUIRED",
  FORBIDDEN_SUBSCRIPTION_EXPIRED: "FORBIDDEN_SUBSCRIPTION_EXPIRED",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  VALIDATION_INVALID_EMAIL: "VALIDATION_INVALID_EMAIL",
  VALIDATION_INVALID_PASSWORD: "VALIDATION_INVALID_PASSWORD",
  VALIDATION_REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD",
  VALIDATION_INVALID_FORMAT: "VALIDATION_INVALID_FORMAT",
  VALIDATION_TOO_SHORT: "VALIDATION_TOO_SHORT",
  VALIDATION_TOO_LONG: "VALIDATION_TOO_LONG",
  VALIDATION_DUPLICATE: "VALIDATION_DUPLICATE",

  // Resource
  NOT_FOUND: "NOT_FOUND",
  NOT_FOUND_USER: "NOT_FOUND_USER",
  NOT_FOUND_QUESTION: "NOT_FOUND_QUESTION",
  NOT_FOUND_SUBJECT: "NOT_FOUND_SUBJECT",
  NOT_FOUND_TOPIC: "NOT_FOUND_TOPIC",
  NOT_FOUND_SUBSCRIPTION: "NOT_FOUND_SUBSCRIPTION",
  NOT_FOUND_LESSON: "NOT_FOUND_LESSON",
  NOT_FOUND_SCAN_JOB: "NOT_FOUND_SCAN_JOB",

  // Conflict
  CONFLICT: "CONFLICT",
  CONFLICT_EMAIL_EXISTS: "CONFLICT_EMAIL_EXISTS",
  CONFLICT_USERNAME_EXISTS: "CONFLICT_USERNAME_EXISTS",

  // Rate Limiting
  RATE_LIMITED: "RATE_LIMITED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  RATE_LIMIT_TOO_MANY_REQUESTS: "RATE_LIMIT_TOO_MANY_REQUESTS",

  // Server Errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  CACHE_ERROR: "CACHE_ERROR",
  QUEUE_ERROR: "QUEUE_ERROR",
  AI_SERVICE_ERROR: "AI_SERVICE_ERROR",
  OCR_SERVICE_ERROR: "OCR_SERVICE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // Business Logic
  SUBSCRIPTION_EXPIRED: "SUBSCRIPTION_EXPIRED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  SCAN_JOB_FAILED: "SCAN_JOB_FAILED",
  LESSON_GENERATION_FAILED: "LESSON_GENERATION_FAILED",

  // Input/Output
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  FILE_TYPE_NOT_SUPPORTED: "FILE_TYPE_NOT_SUPPORTED",
  FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED",
  FILE_NOT_FOUND: "FILE_NOT_FOUND",

  // Misc
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED"
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const ErrorCodeMessages: Record<ErrorCode, string> = {
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: "Authentication token has expired",
  [ErrorCodes.AUTH_TOKEN_INVALID]: "Invalid authentication token",
  [ErrorCodes.AUTH_REFRESH_FAILED]: "Failed to refresh authentication token",
  [ErrorCodes.AUTH_SESSION_EXPIRED]: "Session has expired, please login again",
  [ErrorCodes.AUTH_ACCOUNT_LOCKED]: "Account has been locked",
  [ErrorCodes.AUTH_ACCOUNT_DISABLED]: "Account has been disabled",
  [ErrorCodes.AUTH_2FA_REQUIRED]: "Two-factor authentication required",
  [ErrorCodes.AUTH_2FA_INVALID]: "Invalid two-factor authentication code",
  [ErrorCodes.FORBIDDEN]: "Access denied",
  [ErrorCodes.FORBIDDEN_PREMIUM_REQUIRED]: "Premium subscription required",
  [ErrorCodes.FORBIDDEN_SUBSCRIPTION_EXPIRED]: "Subscription has expired",
  [ErrorCodes.VALIDATION_ERROR]: "Validation failed",
  [ErrorCodes.VALIDATION_INVALID_EMAIL]: "Invalid email address",
  [ErrorCodes.VALIDATION_INVALID_PASSWORD]: "Password does not meet requirements",
  [ErrorCodes.VALIDATION_REQUIRED_FIELD]: "This field is required",
  [ErrorCodes.VALIDATION_INVALID_FORMAT]: "Invalid format",
  [ErrorCodes.VALIDATION_TOO_SHORT]: "Input is too short",
  [ErrorCodes.VALIDATION_TOO_LONG]: "Input is too long",
  [ErrorCodes.VALIDATION_DUPLICATE]: "Value already exists",
  [ErrorCodes.NOT_FOUND]: "Resource not found",
  [ErrorCodes.NOT_FOUND_USER]: "User not found",
  [ErrorCodes.NOT_FOUND_QUESTION]: "Question not found",
  [ErrorCodes.NOT_FOUND_SUBJECT]: "Subject not found",
  [ErrorCodes.NOT_FOUND_TOPIC]: "Topic not found",
  [ErrorCodes.NOT_FOUND_SUBSCRIPTION]: "Subscription not found",
  [ErrorCodes.NOT_FOUND_LESSON]: "Lesson not found",
  [ErrorCodes.NOT_FOUND_SCAN_JOB]: "Scan job not found",
  [ErrorCodes.CONFLICT]: "Resource conflict",
  [ErrorCodes.CONFLICT_EMAIL_EXISTS]: "Email already registered",
  [ErrorCodes.CONFLICT_USERNAME_EXISTS]: "Username already taken",
  [ErrorCodes.RATE_LIMITED]: "Rate limit exceeded",
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: "Rate limit exceeded",
  [ErrorCodes.RATE_LIMIT_TOO_MANY_REQUESTS]: "Too many requests",
  [ErrorCodes.INTERNAL_ERROR]: "An internal error occurred",
  [ErrorCodes.DATABASE_ERROR]: "Database error",
  [ErrorCodes.CACHE_ERROR]: "Cache error",
  [ErrorCodes.QUEUE_ERROR]: "Queue error",
  [ErrorCodes.AI_SERVICE_ERROR]: "AI service error",
  [ErrorCodes.OCR_SERVICE_ERROR]: "OCR service error",
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: "External service error",
  [ErrorCodes.SUBSCRIPTION_EXPIRED]: "Subscription has expired",
  [ErrorCodes.QUOTA_EXCEEDED]: "Quota exceeded",
  [ErrorCodes.PAYMENT_FAILED]: "Payment failed",
  [ErrorCodes.SCAN_JOB_FAILED]: "Scan job failed",
  [ErrorCodes.LESSON_GENERATION_FAILED]: "Lesson generation failed",
  [ErrorCodes.FILE_TOO_LARGE]: "File too large",
  [ErrorCodes.FILE_TYPE_NOT_SUPPORTED]: "File type not supported",
  [ErrorCodes.FILE_UPLOAD_FAILED]: "File upload failed",
  [ErrorCodes.FILE_NOT_FOUND]: "File not found",
  [ErrorCodes.UNPROCESSABLE_ENTITY]: "Unprocessable entity",
  [ErrorCodes.SERVICE_UNAVAILABLE]: "Service unavailable",
  [ErrorCodes.METHOD_NOT_ALLOWED]: "Method not allowed"
};