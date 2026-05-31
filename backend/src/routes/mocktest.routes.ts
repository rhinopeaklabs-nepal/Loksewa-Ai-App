import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { MockTestController } from "../domains/mock-test/controllers/MockTestController";

interface MockTestRoutesOptions extends FastifyPluginOptions {
  mockTestController: MockTestController;
}

export async function mockTestRoutes(
  fastify: FastifyInstance,
  opts: MockTestRoutesOptions
): Promise<void> {
  const { mockTestController } = opts;

  fastify.get("/api/mock-tests", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          subjectId: { type: "string" },
          page: { type: "number", minimum: 1, default: 1 },
          limit: { type: "number", minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as { subjectId?: string; page?: number; limit?: number };
      const result = await mockTestController.getAll(query);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get mock tests";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.get("/api/tests", async (request, reply) => {
    const query = request.query as { subjectId?: string; page?: number; limit?: number };
    const result = await mockTestController.getAll(query);
    return reply.send({ success: true, data: result });
  });

  fastify.post("/api/mock-tests/:id/start", {
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
      const result = await mockTestController.startTest(id);
      return reply.status(201).send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start test";
      return reply.status(400).send({ success: false, error: { code: "START_FAILED", message } });
    }
  });

  fastify.post("/api/tests/start", async (request, reply) => {
    const body = request.body as { testId?: string; mockTestId?: string; id?: string };
    const id = body.testId ?? body.mockTestId ?? body.id ?? "loksewa-general-practice";
    const result = await mockTestController.startTest(id);
    return reply.status(201).send({ success: true, data: result });
  });

  fastify.get("/api/mock-attempts/:id", {
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
      const result = await mockTestController.getAttempt(id);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Attempt not found";
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message } });
    }
  });

  fastify.post("/api/mock-attempts/:id/answers", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" }
        }
      },
      body: {
        type: "object",
        required: ["answers"],
        properties: {
          answers: {
            type: "array",
            items: {
              type: "object",
              required: ["questionId", "selectedOptionIndex"],
              properties: {
                questionId: { type: "string" },
                selectedOptionIndex: { type: "number", minimum: 0 }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as { answers: Array<{ questionId: string; selectedOptionIndex: number }> };
      const result = await mockTestController.saveAnswers(id, body.answers);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save answers";
      return reply.status(400).send({ success: false, error: { code: "SAVE_FAILED", message } });
    }
  });

  fastify.post("/api/mock-attempts/:id/submit", {
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
      const result = await mockTestController.submitTest(id);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit test";
      return reply.status(400).send({ success: false, error: { code: "SUBMIT_FAILED", message } });
    }
  });

  fastify.post("/api/tests/:id/submit", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await mockTestController.submitTest(id);
    return reply.send({ success: true, data: result });
  });

  fastify.get("/api/tests/:id/results", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await mockTestController.getResults(id);
    return reply.send({ success: true, data: result });
  });
}
