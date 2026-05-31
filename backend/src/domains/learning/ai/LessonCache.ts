import type { LessonDTO } from "../dto/LessonDTO";

export class LessonCache {
  private readonly store = new Map<string, { lesson: LessonDTO; expiresAt: number }>();
  private readonly ttlMs: number;

  constructor(ttlHours = 24) {
    this.ttlMs = ttlHours * 3_600_000;
  }

  get(key: string): LessonDTO | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.lesson;
  }

  set(key: string, lesson: LessonDTO): void {
    this.store.set(key, {
      lesson,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}