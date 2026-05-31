import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { BaseController } from "../../../core/base/BaseController";
import { HttpStatus } from "../../../core/constants/HttpStatus";
import { AppError } from "../../../core/errors/AppError";
import type { AuthService } from "../services/AuthService";
import { LoginDTOSchema, RegisterDTOSchema } from "../dto/LoginDTO";

export class AuthController extends BaseController {
  private readonly routePrefix = "/api/auth";

  constructor(private readonly authService: AuthService) {
    super();
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.authService.register(request.body);
      return this.created(reply, result);
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

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.authService.login(request.body);
      return this.ok(reply, result);
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

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { refreshToken } = request.body as { refreshToken?: string };
      if (!refreshToken) {
        throw new AppError("Refresh token is required", HttpStatus.BAD_REQUEST, "MISSING_TOKEN");
      }
      const result = await this.authService.refreshToken(refreshToken);
      return this.ok(reply, result);
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

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      if (token) {
        await this.authService.logout(token);
      }
      return this.noContent(reply);
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

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      if (!token) {
        throw new AppError("Authentication required", HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED");
      }
      const payload = await this.authService.validateToken(token);
      if (!payload) {
        throw new AppError("Invalid or expired token", HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
      }
      return this.ok(reply, { userId: payload.userId, email: payload.email, role: payload.role });
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

  async registerSchema() {
    return {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", minLength: 5, maxLength: 320 },
          password: { type: "string", minLength: 8, maxLength: 128 },
          fullName: { type: "string", maxLength: 200 }
        }
      }
    };
  }

  async loginSchema() {
    return {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", minLength: 5, maxLength: 320 },
          password: { type: "string", minLength: 8, maxLength: 128 },
          clientType: { type: "string", enum: ["mobile", "web", "admin"] }
        }
      }
    };
  }

  async refreshSchema() {
    return {
      body: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" }
        }
      }
    };
  }

  async logoutSchema() {
    return {
      headers: {
        type: "object",
        properties: {
          authorization: { type: "string" }
        }
      }
    };
  }

  routes() {
    return {
      register: `POST ${this.routePrefix}/register`,
      login: `POST ${this.routePrefix}/login`,
      refresh: `POST ${this.routePrefix}/refresh`,
      logout: `POST ${this.routePrefix}/logout`,
      me: `GET ${this.routePrefix}/me`
    };
  }

  async registerRoutes(fastify: FastifyInstance) {
    fastify.post(`${this.routePrefix}/register`, {
      schema: await this.registerSchema()
    }, async (request, reply) => this.register(request, reply));

    fastify.post(`${this.routePrefix}/login`, {
      schema: await this.loginSchema()
    }, async (request, reply) => this.login(request, reply));

    fastify.post(`${this.routePrefix}/refresh`, {
      schema: await this.refreshSchema()
    }, async (request, reply) => this.refresh(request, reply));

    fastify.post(`${this.routePrefix}/logout`, {
      schema: await this.logoutSchema()
    }, async (request, reply) => this.logout(request, reply));

    fastify.get(`${this.routePrefix}/me`, {
      schema: await this.logoutSchema()
    }, async (request, reply) => this.getMe(request, reply));
  }
}