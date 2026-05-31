import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { SubjectsController } from "../domains/subjects/controllers/SubjectsController";

interface SubjectsRoutesOptions extends FastifyPluginOptions {
  subjectsController: SubjectsController;
}

export async function subjectsRoutes(
  fastify: FastifyInstance,
  opts: SubjectsRoutesOptions
): Promise<void> {
  const { subjectsController } = opts;

  fastify.get("/api/subjects", async (_request, reply) => {
    try {
      const result = await subjectsController.getAll();
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get subjects";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.get("/api/subjects/:id", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await subjectsController.getById(id);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Subject not found";
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message } });
    }
  });

  fastify.get("/api/subjects/:id/topics", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await subjectsController.getTopics(id);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Topics not found";
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message } });
    }
  });

  fastify.get("/api/topics/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await subjectsController.getTopicById(id);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Topic not found";
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message } });
    }
  });
}
