import { BaseController } from "../../../core/base/BaseController";

export class AnswerController extends BaseController {
  async getByQuestionId(questionId: string) {
    return {
      questionId,
      answerText: "Verified answer is returned from the question bank when available.",
      explanation: "The answer service always prefers verified database records before AI output.",
      source: "verified_db",
      isVerified: true
    };
  }

  async verify(questionId: string, payload: { answerId: string; isCorrect: boolean; verifiedBy?: string }) {
    return {
      questionId,
      answerId: payload.answerId,
      isVerified: payload.isCorrect,
      verifiedBy: payload.verifiedBy ?? "admin",
      verifiedAt: new Date().toISOString()
    };
  }

  routes() {
    return {
      detail: "GET /api/answers/:questionId",
      verify: "POST /api/answers/:questionId/verify"
    };
  }
}
