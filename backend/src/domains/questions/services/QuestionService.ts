import { BaseService } from "../../../core/base/BaseService";
import { randomUUID } from "node:crypto";
import type { CreateQuestionDTO } from "../dto/CreateQuestionDTO";
import type { Question } from "../entities/Question";

export class QuestionService extends BaseService {
  constructor() {
    super("QuestionService");
  }

  create(payload: CreateQuestionDTO): Question {
    const now = new Date();
    return {
      id: randomUUID(),
      text: payload.questionText,
      category: "General Knowledge",
      difficulty: "medium",
      verified: false,
      createdAt: now,
      updatedAt: now
    };
  }

  filter(questions: Question[], filters: { category?: string; difficulty?: string; verified?: boolean }): Question[] {
    return questions.filter((question) => {
      if (filters.category && question.category !== filters.category) return false;
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
      if (filters.verified !== undefined && question.verified !== filters.verified) return false;
      return true;
    });
  }
}
