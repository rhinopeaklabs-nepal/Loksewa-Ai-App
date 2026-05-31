import { HttpStatus } from "../constants/HttpStatus";
import { ErrorCodes } from "../constants/ErrorCodes";
import { AppError, type ErrorResponse } from "./AppError";

/**
 * Not Found Error (404)
 * Used when a requested resource cannot be found
 */
export class NotFoundError extends AppError {
  constructor(
    message = "Resource not found",
    resourceType?: string,
    resourceId?: string | number
  ) {
    const details: Record<string, unknown> = {};
    if (resourceType) {
      details.resourceType = resourceType;
    }
    if (resourceId !== undefined) {
      details.resourceId = resourceId;
    }

    super(
      message,
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND,
      Object.keys(details).length > 0 ? details : undefined
    );
  }

  /**
   * Create a NotFoundError for a specific resource
   */
  static forResource(resourceType: string, resourceId?: string | number): NotFoundError {
    const message = resourceId
      ? `${resourceType} with id '${resourceId}' not found`
      : `${resourceType} not found`;
    return new NotFoundError(message, resourceType, resourceId);
  }

  /**
   * Convert to API error response
   */
  toResponse(): ErrorResponse {
    return this.toJSON();
  }
}

/**
 * Create a NotFoundError for user
 */
export function notFoundUser(userId?: string): NotFoundError {
  return NotFoundError.forResource("User", userId);
}

/**
 * Create a NotFoundError for question
 */
export function notFoundQuestion(questionId?: string): NotFoundError {
  return NotFoundError.forResource("Question", questionId);
}

/**
 * Create a NotFoundError for subject
 */
export function notFoundSubject(subjectId?: string): NotFoundError {
  return NotFoundError.forResource("Subject", subjectId);
}

/**
 * Create a NotFoundError for topic
 */
export function notFoundTopic(topicId?: string): NotFoundError {
  return NotFoundError.forResource("Topic", topicId);
}

/**
 * Create a NotFoundError for subscription
 */
export function notFoundSubscription(subscriptionId?: string): NotFoundError {
  return NotFoundError.forResource("Subscription", subscriptionId);
}