import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { AnswerController } from "../domains/answers/controllers/AnswerController";

interface AnswersRoutesOptions extends FastifyPluginOptions {
  answerController: AnswerController;
}

export async function answersRoutes(
  fastify: FastifyInstance,
  opts: AnswersRoutesOptions
): Promise<void> {
  const { answerController } = opts;

  fastify.get("/api/answers/:questionId", {
    schema: {
      params: {
        type: "object",
        required: ["questionId"],
        properties: {
          questionId: { type: "string" }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { questionId } = request.params as { questionId: string };
      const result = await answerController.getByQuestionId(questionId);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Answers not found";
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message } });
    }
  });

  fastify.post("/api/admin/answers/:questionId/verify", {
    schema: {
      params: {
        type: "object",
        required: ["questionId"],
        properties: {
          questionId: { type: "string" }
        }
      },
      body: {
        type: "object",
        required: ["answerId"],
        properties: {
          answerId: { type: "string" },
          isCorrect: { type: "boolean" },
          verifiedBy: { type: "string" }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { questionId } = request.params as { questionId: string };
      const body = request.body as { answerId: string; isCorrect: boolean; verifiedBy?: string };
      const result = await answerController.verify(questionId, body);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed";
      return reply.status(400).send({ success: false, error: { code: "VERIFICATION_FAILED", message } });
    }
  });
}