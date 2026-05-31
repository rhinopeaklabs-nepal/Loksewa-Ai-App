import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { Question } from "../entities/Question";

export interface QuestionRepository extends BaseRepository<Question> {
  search(query: string): Promise<Question[]>;
}
