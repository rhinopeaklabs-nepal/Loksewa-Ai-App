import { BaseService } from "../../../core/base/BaseService";
import { percent } from "../../../core/utils/helpers";

export class AnalyticsService extends BaseService {
  constructor() {
    super("AnalyticsService");
  }

  summarize(input: { answered: number; correct: number; studyMinutes: number }) {
    return {
      questionsAnswered: input.answered,
      accuracy: percent(input.correct, input.answered),
      studyMinutes: input.studyMinutes
    };
  }
}
