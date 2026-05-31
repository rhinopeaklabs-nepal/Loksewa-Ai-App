import { BaseService } from "../../../core/base/BaseService";
import { normalizeSearchText } from "../../../core/utils/helpers";
import type { Question } from "../entities/Question";

export interface QuestionSearchResult {
  question: Question;
  score: number;
}

export class QuestionSearchService extends BaseService {
  constructor() {
    super("QuestionSearchService");
  }

  search(query: string, questions: Question[], limit = 10): QuestionSearchResult[] {
    const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
    return questions
      .map((question) => {
        const text = normalizeSearchText(`${question.text} ${question.category}`);
        const score = terms.filter((term) => text.includes(term)).length / Math.max(terms.length, 1);
        return { question, score };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
