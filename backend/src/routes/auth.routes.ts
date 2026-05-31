import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { AuthController } from "../domains/auth/controllers/AuthController";

interface AuthRoutesOptions extends FastifyPluginOptions {
  authController: AuthController;
}

export async function authRoutes(
  fastify: FastifyInstance,
  opts: AuthRoutesOptions
): Promise<void> {
  const { authController } = opts;

  fastify.post("/api/auth/register", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password", "fullName"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          fullName: { type: "string", minLength: 1 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const result = await authController.register(request.body);
      return reply.status(201).send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      return reply.status(400).send({ success: false, error: { code: "REGISTRATION_FAILED", message } });
    }
  });

  fastify.post("/api/auth/login", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const result = await authController.login(request.body);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return reply.status(401).send({ success: false, error: { code: "LOGIN_FAILED", message } });
    }
  });

  fastify.post("/api/auth/refresh", {
    schema: {
      body: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      const result = await authController.refresh(refreshToken);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Token refresh failed";
      return reply.status(401).send({ success: false, error: { code: "REFRESH_FAILED", message } });
    }
  });

  fastify.post("/api/auth/logout", async (_request, reply) => {
    return reply.send({ success: true, data: { message: "Logged out successfully" } });
  });
}