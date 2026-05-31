import { BaseService } from "../../../core/base/BaseService";
import type { AnswerDTO } from "../dto/AnswerDTO";
import type { Answer } from "../entities/Answer";

export class AnswerService extends BaseService {
  constructor() {
    super("AnswerService");
  }

  toDto(answer: Answer, verified: boolean): AnswerDTO {
    return {
      questionId: answer.questionId,
      correctOption: answer.correctOption,
      explanation: answer.explanation,
      sourceName: answer.sourceId,
      verified
    };
  }

  selectVerifiedFirst(answers: Answer[]): Answer | null {
    return answers.find((answer) => Boolean(answer.sourceId)) ?? answers[0] ?? null;
  }
}
