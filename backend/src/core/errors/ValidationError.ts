import { HttpStatus } from "../constants/HttpStatus";
import { ErrorCodes } from "../constants/ErrorCodes";
import { AppError, type ErrorResponse } from "./AppError";

/**
 * Validation Error (400)
 * Used when input data fails validation
 */
export class ValidationError extends AppError {
  public readonly fieldErrors: FieldError[];

  constructor(
    message = "Validation failed",
    fieldErrors?: FieldError[],
    details?: Record<string, unknown>
  ) {
    const errors = fieldErrors || [];
    
    super(
      message,
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR,
      {
        fieldErrors: errors,
        ...details
      }
    );

    this.fieldErrors = errors;
  }

  /**
   * Create a ValidationError for a single field
   */
  static forField(field: string, message: string): ValidationError {
    return new ValidationError(
      `Validation failed for field '${field}'`,
      [{ field, message }]
    );
  }

  /**
   * Create a ValidationError for multiple fields
   */
  static forFields(errors: FieldError[]): ValidationError {
    return new ValidationError(
      `Validation failed for ${errors.length} field(s)`,
      errors
    );
  }

  /**
   * Add another field error
   */
  addFieldError(field: string, message: string): ValidationError {
    return new ValidationError(this.message, [...this.fieldErrors, { field, message }], this.details);
  }

  /**
   * Check if there are any field errors
   */
  hasErrors(): boolean {
    return this.fieldErrors.length > 0;
  }

  /**
   * Get field error for a specific field
   */
  getFieldError(field: string): string | undefined {
    return this.fieldErrors.find(e => e.field === field)?.message;
  }

  /**
   * Convert to API error response
   */
  toResponse(): ErrorResponse {
    return this.toJSON();
  }
}

/**
 * Field-level error structure
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Create a required field validation error
 */
export function requiredField(field: string): ValidationError {
  return ValidationError.forField(field, `${field} is required`);
}

/**
 * Create an invalid format validation error
 */
export function invalidFormat(field: string, expected: string): ValidationError {
  return ValidationError.forField(field, `${field} has invalid format. Expected: ${expected}`);
}

/**
 * Create a too short validation error
 */
export function tooShort(field: string, minLength: number): ValidationError {
  return ValidationError.forField(field, `${field} must be at least ${minLength} characters`);
}

/**
 * Create a too long validation error
 */
export function tooLong(field: string, maxLength: number): ValidationError {
  return ValidationError.forField(field, `${field} must not exceed ${maxLength} characters`);
}