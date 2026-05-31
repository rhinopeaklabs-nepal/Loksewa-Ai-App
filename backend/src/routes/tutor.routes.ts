import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { TutorController } from "../domains/ai-tutor/controllers/TutorController";

interface TutorRoutesOptions extends FastifyPluginOptions {
  tutorController: TutorController;
}

export async function tutorRoutes(
  fastify: FastifyInstance,
  opts: TutorRoutesOptions
): Promise<void> {
  const { tutorController } = opts;

  fastify.post("/api/tutor/chat", {
    schema: {
      body: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string", minLength: 1 },
          conversationId: { type: "string" },
          context: {
            type: "object",
            properties: {
              subjectId: { type: "string" },
              topicId: { type: "string" }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const body = request.body as {
        message: string;
        conversationId?: string;
        context?: { subjectId?: string; topicId?: string };
      };
      const result = await tutorController.chat(body);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chat failed";
      return reply.status(500).send({ success: false, error: { code: "CHAT_FAILED", message } });
    }
  });

  fastify.get("/api/tutor/conversations", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          page: { type: "number", minimum: 1, default: 1 },
          limit: { type: "number", minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as { page?: number; limit?: number };
      const result = await tutorController.getConversations(query);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get conversations";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.get("/api/tutor/conversations/:id", {
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
      const result = await tutorController.getConversationById(id);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Conversation not found";
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message } });
    }
  });

  fastify.get("/api/tutor/conversations/:id/messages", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await tutorController.getConversationMessages(id);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Conversation not found";
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message } });
    }
  });
}
