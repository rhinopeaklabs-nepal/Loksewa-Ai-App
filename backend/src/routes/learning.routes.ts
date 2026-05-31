import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { LearningController } from "../domains/learning/controllers/LearningController";

interface LearningRoutesOptions extends FastifyPluginOptions {
  learningController: LearningController;
}

export async function learningRoutes(
  fastify: FastifyInstance,
  opts: LearningRoutesOptions
): Promise<void> {
  const { learningController } = opts;

  async function generateLessonHandler(request: { body: unknown }, reply: { status: (code: number) => { send: (payload: unknown) => unknown } }) {
    try {
      const body = request.body as {
        subjectId?: string;
        topicId?: string;
        questionId?: string;
        level?: string;
        preferredLanguage?: string;
      };
      const result = await learningController.generateLesson({
        subjectId: body.subjectId ?? "general",
        topicId: body.topicId ?? body.questionId ?? "general",
        level: body.level,
        preferredLanguage: body.preferredLanguage
      });
      return reply.status(202).send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate lesson";
      return reply.status(400).send({ success: false, error: { code: "GENERATE_FAILED", message } });
    }
  }

  fastify.get("/api/learning/lessons", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          subjectId: { type: "string" },
          topicId: { type: "string" },
          page: { type: "number", minimum: 1, default: 1 },
          limit: { type: "number", minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as {
        subjectId?: string;
        topicId?: string;
        page?: number;
        limit?: number;
      };
      const result = await learningController.getLessons(query);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get lessons";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.post("/api/learning/lessons/generate", {
    schema: {
      body: {
        type: "object",
        required: ["subjectId", "topicId"],
        properties: {
          subjectId: { type: "string" },
          topicId: { type: "string" },
          level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          preferredLanguage: { type: "string", enum: ["en", "ne"] }
        }
      }
    }
  }, generateLessonHandler);

  fastify.post("/api/lessons/generate", {
    schema: {
      body: {
        type: "object",
        properties: {
          questionId: { type: "string" },
          subjectId: { type: "string" },
          topicId: { type: "string" },
          level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          preferredLanguage: { type: "string", enum: ["en", "ne"] }
        }
      }
    }
  }, generateLessonHandler);

  fastify.get("/api/lessons/:questionId", {
    schema: {
      params: {
        type: "object",
        required: ["questionId"],
        properties: { questionId: { type: "string" } }
      }
    }
  }, async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    const result = await learningController.getLessonByQuestionId(questionId);
    return reply.send({ success: true, data: result });
  });

  fastify.get("/api/learning/flashcards", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          subjectId: { type: "string" },
          topicId: { type: "string" },
          status: { type: "string", enum: ["new", "learning", "mastered"] }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as {
        subjectId?: string;
        topicId?: string;
        status?: string;
      };
      const result = await learningController.getFlashcards(query);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get flashcards";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.get("/api/flashcards", async (request, reply) => {
    const query = request.query as { topic?: string; subjectId?: string; topicId?: string; status?: string };
    const result = await learningController.getFlashcards({
      subjectId: query.subjectId,
      topicId: query.topicId ?? query.topic,
      status: query.status
    });
    return reply.send({ success: true, data: result });
  });

  fastify.post("/api/flashcards/:id/review", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await learningController.reviewFlashcard(id, request.body as { quality?: number; rating?: number });
    return reply.send({ success: true, data: result });
  });

  fastify.get("/api/learning/progress", async (_request, reply) => {
    try {
      const result = await learningController.getProgress();
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get progress";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.get("/api/progress", async (_request, reply) => {
    const result = await learningController.getProgress();
    return reply.send({ success: true, data: result });
  });

  fastify.put("/api/progress/:topicId", async (request, reply) => {
    const { topicId } = request.params as { topicId: string };
    const result = await learningController.updateProgress(
      topicId,
      request.body as { completionPercentage?: number; completion_percentage?: number }
    );
    return reply.send({ success: true, data: result });
  });
}
