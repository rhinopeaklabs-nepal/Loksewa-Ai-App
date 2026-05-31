import { FastifyBaseLogger } from "fastify";
import pino from "pino";

/**
 * Base service class providing logging and common functionality.
 * All domain services should extend this class.
 */
export abstract class BaseService {
  protected readonly logger: FastifyBaseLogger;
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logger = pino({ level: "info" }).child({ service: serviceName });
  }

  /**
   * Log informational message
   */
  protected info(message: string, data?: Record<string, unknown>): void {
    if (data) {
      this.logger.info(data, message);
    } else {
      this.logger.info(message);
    }
  }

  /**
   * Log warning message
   */
  protected warn(message: string, data?: Record<string, unknown>): void {
    if (data) {
      this.logger.warn(data, message);
    } else {
      this.logger.warn(message);
    }
  }

  /**
   * Log error message
   */
  protected error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    if (error instanceof Error) {
      this.logger.error({ ...data, err: error }, message);
    } else if (error) {
      this.logger.error({ ...data, error }, message);
    } else {
      this.logger.error(message);
    }
  }

  /**
   * Log debug message
   */
  protected debug(message: string, data?: Record<string, unknown>): void {
    if (data) {
      this.logger.debug(data, message);
    } else {
      this.logger.debug(message);
    }
  }

  /**
   * Create a child logger with additional context
   */
  protected childLogger(bindings: Record<string, unknown>): FastifyBaseLogger {
    return this.logger.child(bindings);
  }
}