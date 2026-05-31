import { BaseService } from "../../../core/base/BaseService";
import type { StudyProgress } from "../entities/StudyProgress";
import type { ProgressDTO } from "../dto/ProgressDTO";

export interface StudyProgressRepository {
  findByUser(userId: string): Promise<StudyProgress[]>;
  findByUserAndTopic(userId: string, topicId: string): Promise<StudyProgress | null>;
  create(data: Omit<StudyProgress, "id" | "createdAt" | "updatedAt">): Promise<StudyProgress>;
  update(id: string, data: Partial<StudyProgress>): Promise<StudyProgress>;
}

export interface ProgressUpdateInput {
  userId: string;
  topicId: string;
  completionPercentage: number;
  accuracy?: number;
}

export class ProgressTrackingService extends BaseService {
  constructor(private readonly repository: StudyProgressRepository) {
    super("ProgressTrackingService");
  }

  async getUserProgress(userId: string): Promise<ProgressDTO[]> {
    const progressList = await this.repository.findByUser(userId);
    return progressList.map(p => ({
      userId: p.userId,
      topicId: p.topicId,
      completedLessons: p.completedLessons,
      accuracy: p.accuracy
    }));
  }

  async updateProgress(input: ProgressUpdateInput): Promise<StudyProgress> {
    const existing = await this.repository.findByUserAndTopic(input.userId, input.topicId);

    if (existing) {
      // Update existing progress
      const updated = await this.repository.update(existing.id, {
        completionPercentage: input.completionPercentage,
        accuracy: input.accuracy,
        lastStudiedAt: new Date(),
        streakDays: await this.calculateStreak(input.userId)
      });
      return updated;
    }

    // Create new progress record
    const newProgress = await this.repository.create({
      userId: input.userId,
      topicId: input.topicId,
      completedLessons: 0,
      accuracy: input.accuracy ?? 0,
      completionPercentage: input.completionPercentage,
      questionsAttempted: 0,
      questionsCorrect: 0,
      timeSpentMinutes: 0,
      lastStudiedAt: new Date(),
      streakDays: 1,
      masteryLevel: "beginner"
    });

    return newProgress;
  }

  async incrementLessonCount(userId: string, topicId: string): Promise<void> {
    const existing = await this.repository.findByUserAndTopic(userId, topicId);
    if (existing) {
      await this.repository.update(existing.id, {
        completedLessons: existing.completedLessons + 1,
        lastStudiedAt: new Date()
      });
    }
  }

  async recordAnswer(
    userId: string,
    topicId: string,
    correct: boolean,
    timeSpentSeconds: number
  ): Promise<void> {
    const existing = await this.repository.findByUserAndTopic(userId, topicId);
    if (existing) {
      const newQuestionsAttempted = existing.questionsAttempted + 1;
      const newQuestionsCorrect = existing.questionsCorrect + (correct ? 1 : 0);
      const newAccuracy = (newQuestionsCorrect / newQuestionsAttempted) * 100;

      await this.repository.update(existing.id, {
        questionsAttempted: newQuestionsAttempted,
        questionsCorrect: newQuestionsCorrect,
        accuracy: newAccuracy,
        timeSpentMinutes: existing.timeSpentMinutes + Math.round(timeSpentSeconds / 60),
        lastStudiedAt: new Date()
      });
    }
  }

  private async calculateStreak(userId: string): Promise<number> {
    const progressList = await this.repository.findByUser(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 1;
    const sortedProgress = progressList
      .filter(p => p.lastStudiedAt)
      .sort((a, b) => new Date(b.lastStudiedAt!).getTime() - new Date(a.lastStudiedAt!).getTime());

    for (let i = 0; i < sortedProgress.length - 1; i++) {
      const current = new Date(sortedProgress[i].lastStudiedAt!);
      const previous = new Date(sortedProgress[i + 1].lastStudiedAt!);
      current.setHours(0, 0, 0, 0);
      previous.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  }
}