import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { UserController } from "../domains/user/controllers/UserController";

interface UserRoutesOptions extends FastifyPluginOptions {
  userController: UserController;
}

export async function userRoutes(
  fastify: FastifyInstance,
  opts: UserRoutesOptions
): Promise<void> {
  const { userController } = opts;

  fastify.get("/api/users/me", async (_request, reply) => {
    try {
      const result = await userController.getMe();
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get user";
      return reply.status(401).send({ success: false, error: { code: "UNAUTHORIZED", message } });
    }
  });

  fastify.patch("/api/users/me", {
    schema: {
      body: {
        type: "object",
        properties: {
          fullName: { type: "string", minLength: 1 },
          avatarUrl: { type: "string" },
          preferences: {
            type: "object",
            properties: {
              language: { type: "string" },
              notifications: { type: "boolean" }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const result = await userController.updateMe(request.body);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user";
      return reply.status(400).send({ success: false, error: { code: "UPDATE_FAILED", message } });
    }
  });

  fastify.get("/api/users/me/stats", async (_request, reply) => {
    try {
      const result = await userController.getStats();
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get stats";
      return reply.status(500).send({ success: false, error: { code: "STATS_FAILED", message } });
    }
  });
}