import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { BaseController } from "../../../core/base/BaseController";
import { HttpStatus } from "../../../core/constants/HttpStatus";
import { AppError } from "../../../core/errors/AppError";
import { UserService, UpdateProfileDTOSchema, UpdatePreferencesDTOSchema } from "../services/UserService";

export class UserController extends BaseController {
  private readonly routePrefix = "/api/users";
  private readonly userService: UserService;

  constructor(userService: UserService) {
    super();
    this.userService = userService;
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as FastifyRequest & { user?: { userId: number } }).user?.userId;
      if (!userId) {
        throw new AppError("Authentication required", HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED");
      }
      const profile = await this.userService.getProfile(userId);
      return this.ok(reply, profile);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      throw error;
    }
  }

  async updateMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as FastifyRequest & { user?: { userId: number } }).user?.userId;
      if (!userId) {
        throw new AppError("Authentication required", HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED");
      }
      const updated = await this.userService.updateProfile(userId, request.body);
      return this.ok(reply, updated);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      throw error;
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as FastifyRequest & { user?: { userId: number } }).user?.userId;
      if (!userId) {
        throw new AppError("Authentication required", HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED");
      }
      const stats = await this.userService.getUserStats(userId);
      return this.ok(reply, stats);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      throw error;
    }
  }

  async getProgress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as FastifyRequest & { user?: { userId: number } }).user?.userId;
      if (!userId) {
        throw new AppError("Authentication required", HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED");
      }
      const progress = await this.userService.getUserProgress(userId);
      return this.ok(reply, progress);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      throw error;
    }
  }

  async updateProgress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as FastifyRequest & { user?: { userId: number } }).user?.userId;
      if (!userId) {
        throw new AppError("Authentication required", HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED");
      }
      const { topicId, completionPercentage } = request.body as {
        topicId?: number;
        completionPercentage?: number;
      };
      if (!topicId || completionPercentage === undefined) {
        throw new AppError("topicId and completionPercentage are required", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
      }
      const progress = await this.userService.updateTopicProgress(userId, topicId, completionPercentage);
      return this.ok(reply, progress);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      throw error;
    }
  }

  async getPreferences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as FastifyRequest & { user?: { userId: number } }).user?.userId;
      if (!userId) {
        throw new AppError("Authentication required", HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED");
      }
      const preferences = await this.userService.getUserPreferences(userId);
      return this.ok(reply, preferences);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      throw error;
    }
  }

  async updatePreferences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as FastifyRequest & { user?: { userId: number } }).user?.userId;
      if (!userId) {
        throw new AppError("Authentication required", HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED");
      }
      const preferences = await this.userService.updatePreferences(userId, request.body);
      return this.ok(reply, preferences);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      throw error;
    }
  }

  routes() {
    return {
      me: `GET ${this.routePrefix}/me`,
      updateMe: `PUT ${this.routePrefix}/me`,
      stats: `GET ${this.routePrefix}/stats`,
      progress: `GET ${this.routePrefix}/progress`,
      updateProgress: `PUT ${this.routePrefix}/progress`,
      preferences: `GET ${this.routePrefix}/preferences`,
      updatePreferences: `PUT ${this.routePrefix}/preferences`,
    };
  }

  async registerRoutes(fastify: FastifyInstance) {
    fastify.get(`${this.routePrefix}/me`, async (request, reply) => this.getMe(request, reply));
    fastify.put(`${this.routePrefix}/me`, async (request, reply) => this.updateMe(request, reply));
    fastify.get(`${this.routePrefix}/stats`, async (request, reply) => this.getStats(request, reply));
    fastify.get(`${this.routePrefix}/progress`, async (request, reply) => this.getProgress(request, reply));
    fastify.put(`${this.routePrefix}/progress`, async (request, reply) => this.updateProgress(request, reply));
    fastify.get(`${this.routePrefix}/preferences`, async (request, reply) => this.getPreferences(request, reply));
    fastify.put(`${this.routePrefix}/preferences`, async (request, reply) => this.updatePreferences(request, reply));
  }
}