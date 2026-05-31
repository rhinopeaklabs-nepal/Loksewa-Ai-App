import { BaseController } from "../../../core/base/BaseController";
import { randomUUID } from "node:crypto";

export class MockTestController extends BaseController {
  private readonly tests = new Map([
    [
      "loksewa-general-practice",
      {
        id: "loksewa-general-practice",
        title: "Loksewa General Practice",
        subjectId: "mixed",
        durationMinutes: 45,
        totalQuestions: 50,
        negativeMarking: 0.2,
        isActive: true
      }
    ]
  ]);
  private readonly attempts = new Map<string, Record<string, unknown>>();

  async getAll(query: { subjectId?: string; page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const items = [...this.tests.values()].filter((test) => !query.subjectId || test.subjectId === query.subjectId);
    return {
      page,
      per_page: limit,
      total: items.length,
      items: items.slice((page - 1) * limit, page * limit)
    };
  }

  async startTest(id: string) {
    const test = this.tests.get(id);
    if (!test) throw new Error("Mock test not found");
    const attempt = {
      id: randomUUID(),
      testId: id,
      startedAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + test.durationMinutes * 60_000).toISOString(),
      status: "in_progress",
      answers: []
    };
    this.attempts.set(attempt.id, attempt);
    return attempt;
  }

  async getAttempt(id: string) {
    const attempt = this.attempts.get(id);
    if (!attempt) throw new Error("Attempt not found");
    return attempt;
  }

  async saveAnswers(id: string, answers: Array<{ questionId: string; selectedOptionIndex: number }>) {
    const attempt = await this.getAttempt(id);
    const updated = { ...attempt, answers, updatedAt: new Date().toISOString() };
    this.attempts.set(id, updated);
    return updated;
  }

  async submitTest(id: string) {
    const attempt = await this.getAttempt(id);
    const answers = (attempt.answers as Array<{ selectedOptionIndex: number }> | undefined) ?? [];
    const result = {
      ...attempt,
      status: "submitted",
      submittedAt: new Date().toISOString(),
      score: answers.length,
      totalAnswered: answers.length
    };
    this.attempts.set(id, result);
    return result;
  }

  async getResults(id: string) {
    const attempt = await this.getAttempt(id);
    if (attempt.status !== "submitted") {
      return this.submitTest(id);
    }
    return attempt;
  }

  routes() {
    return {
      list: "GET /api/mock-tests",
      start: "POST /api/mock-tests/:id/start",
      answer: "POST /api/mock-attempts/:id/answers",
      submit: "POST /api/mock-attempts/:id/submit"
    };
  }
}
