import { BaseController } from "../../../core/base/BaseController";
import { randomUUID } from "node:crypto";

type StoredQuestion = {
  id: string;
  subjectId: string;
  content: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export class QuestionController extends BaseController {
  private readonly questions = new Map<string, StoredQuestion>([
    [
      "sample-constitution-1",
      {
        id: "sample-constitution-1",
        subjectId: "constitution",
        content: "How many fundamental rights are guaranteed by the Constitution of Nepal?",
        options: ["21", "31", "35", "45"],
        correctOptionIndex: 1,
        explanation: "Part 3 of the Constitution of Nepal guarantees 31 fundamental rights.",
        difficulty: "medium",
        tags: ["constitution", "fundamental-rights"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  ]);

  async getAll(query: { page?: number; limit?: number; subjectId?: string; difficulty?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filtered = [...this.questions.values()].filter((question) => {
      if (query.subjectId && question.subjectId !== query.subjectId) return false;
      if (query.difficulty && question.difficulty !== query.difficulty) return false;
      return true;
    });
    return {
      page,
      per_page: limit,
      total: filtered.length,
      items: filtered.slice((page - 1) * limit, page * limit)
    };
  }

  async search(query: { q: string; subjectId?: string; page?: number; limit?: number }) {
    const normalized = query.q.toLowerCase();
    const result = await this.getAll({
      page: query.page,
      limit: query.limit,
      subjectId: query.subjectId
    });
    return {
      ...result,
      items: result.items.filter((question) => question.content.toLowerCase().includes(normalized))
    };
  }

  async getById(id: string) {
    const question = this.questions.get(id);
    if (!question) throw new Error("Question not found");
    return question;
  }

  async create(payload: unknown) {
    const body = payload as Omit<StoredQuestion, "id" | "createdAt" | "updatedAt">;
    const now = new Date().toISOString();
    const question: StoredQuestion = {
      id: randomUUID(),
      subjectId: body.subjectId,
      content: body.content,
      options: body.options,
      correctOptionIndex: body.correctOptionIndex,
      explanation: body.explanation ?? "",
      difficulty: body.difficulty ?? "medium",
      tags: body.tags ?? [],
      createdAt: now,
      updatedAt: now
    };
    this.questions.set(question.id, question);
    return question;
  }

  async update(id: string, payload: unknown) {
    const existing = await this.getById(id);
    const body = payload as Partial<StoredQuestion>;
    const updated = { ...existing, ...body, id, updatedAt: new Date().toISOString() };
    this.questions.set(id, updated);
    return updated;
  }

  async delete(id: string) {
    if (!this.questions.delete(id)) throw new Error("Question not found");
    return { id, deleted: true };
  }

  routes() {
    return {
      list: "GET /api/questions",
      search: "GET /api/questions/search",
      detail: "GET /api/questions/:id"
    };
  }
}
