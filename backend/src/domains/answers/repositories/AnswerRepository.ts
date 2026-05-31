import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { Answer } from "../entities/Answer";

export interface AnswerRepository extends BaseRepository<Answer> {
  findByQuestionId(questionId: string): Promise<Answer | null>;
}
