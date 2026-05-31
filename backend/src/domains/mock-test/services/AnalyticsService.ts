import { BaseService } from "../../../core/base/BaseService";
import { percent } from "../../../core/utils/helpers";

export class AnalyticsService extends BaseService {
  constructor() {
    super("MockTestAnalyticsService");
  }

  summarizeAttempt(input: { totalQuestions: number; correctAnswers: number; wrongAnswers: number; score: number }) {
    return {
      ...input,
      accuracy: percent(input.correctAnswers, input.totalQuestions),
      negativeMarkingRisk: input.wrongAnswers > input.correctAnswers
    };
  }
}
