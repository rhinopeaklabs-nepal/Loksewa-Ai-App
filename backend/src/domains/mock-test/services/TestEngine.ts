import { BaseService } from "../../../core/base/BaseService";

export class TestEngine extends BaseService {
  constructor() {
    super("TestEngine");
  }

  selectQuestions<T extends { id: string; difficulty?: string }>(
    questions: T[],
    total: number,
    difficultyMix: Record<string, number> = {}
  ): T[] {
    const selected: T[] = [];
    for (const [difficulty, count] of Object.entries(difficultyMix)) {
      selected.push(...questions.filter((question) => question.difficulty === difficulty).slice(0, count));
    }
    const selectedIds = new Set(selected.map((question) => question.id));
    selected.push(...questions.filter((question) => !selectedIds.has(question.id)).slice(0, total - selected.length));
    return selected.slice(0, total);
  }

  calculateEndsAt(startedAt: Date, durationMinutes: number): Date {
    return new Date(startedAt.getTime() + durationMinutes * 60_000);
  }

  isExpired(startedAt: Date, durationMinutes: number, now = new Date()): boolean {
    return now.getTime() - startedAt.getTime() > durationMinutes * 60_000;
  }
}
