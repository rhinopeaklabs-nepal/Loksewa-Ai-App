import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { QuestionController } from "../domains/questions/controllers/QuestionController";

interface QuestionsRoutesOptions extends FastifyPluginOptions {
  questionController: QuestionController;
}

export async function questionsRoutes(
  fastify: FastifyInstance,
  opts: QuestionsRoutesOptions
): Promise<void> {
  const { questionController } = opts;

  fastify.get("/api/questions", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          page: { type: "number", minimum: 1, default: 1 },
          limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
          subjectId: { type: "string" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as {
        page?: number;
        limit?: number;
        subjectId?: string;
        difficulty?: string;
      };
      const result = await questionController.getAll(query);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get questions";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.get("/api/questions/search", {
    schema: {
      querystring: {
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string", minLength: 1 },
          subjectId: { type: "string" },
          page: { type: "number", minimum: 1, default: 1 },
          limit: { type: "number", minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as { q: string; subjectId?: string; page?: number; limit?: number };
      const result = await questionController.search(query);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      return reply.status(500).send({ success: false, error: { code: "SEARCH_FAILED", message } });
    }
  });

  fastify.get("/api/questions/:id", {
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
      const result = await questionController.getById(id);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Question not found";
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message } });
    }
  });

  fastify.post("/api/admin/questions", {
    schema: {
      body: {
        type: "object",
        required: ["subjectId", "content", "options", "correctOptionIndex"],
        properties: {
          subjectId: { type: "string" },
          content: { type: "string" },
          options: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 6
          },
          correctOptionIndex: { type: "number", minimum: 0 },
          explanation: { type: "string" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          tags: { type: "array", items: { type: "string" } }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const result = await questionController.create(request.body);
      return reply.status(201).send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create question";
      return reply.status(400).send({ success: false, error: { code: "CREATE_FAILED", message } });
    }
  });

  fastify.put("/api/admin/questions/:id", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } }
      },
      body: {
        type: "object",
        properties: {
          content: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctOptionIndex: { type: "number", minimum: 0 },
          explanation: { type: "string" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          tags: { type: "array", items: { type: "string" } }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await questionController.update(id, request.body);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update question";
      return reply.status(400).send({ success: false, error: { code: "UPDATE_FAILED", message } });
    }
  });

  fastify.delete("/api/admin/questions/:id", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await questionController.delete(id);
      return reply.send({ success: true, data: { message: "Question deleted" } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete question";
      return reply.status(400).send({ success: false, error: { code: "DELETE_FAILED", message } });
    }
  });
}