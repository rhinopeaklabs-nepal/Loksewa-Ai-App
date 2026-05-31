import { z } from "zod";
import { BaseService } from "../../../core/base/BaseService";
import { AppError } from "../../../core/errors/AppError";
import { HttpStatus } from "../../../core/constants/HttpStatus";
import { dataSource } from "../../../core/database/DataSource";
import type { UpdateProfileDTO } from "../dto/UpdateProfileDTO";
import type { UserStatsDTO } from "../dto/UserStatsDTO";
import type { UserProfile } from "../entities/UserProfile";
import type { UserProgress } from "../entities/UserProgress";
import type { UserPreferences } from "../entities/UserPreferences";

export const UpdateProfileDTOSchema = z.object({
  fullName: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
});

export const UpdatePreferencesDTOSchema = z.object({
  language: z.enum(["ne", "en"]).optional(),
  aiEnabled: z.boolean().optional(),
  offlineMode: z.boolean().optional(),
});

export class UserService extends BaseService {
  private readonly prisma = dataSource.prisma;

  constructor() {
    super("UserService");
  }

  async getProfile(userId: number): Promise<UserProfile> {
    this.info("Getting user profile", { userId });

    const user = await this.prisma.app_users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
    }

    return {
      id: String(user.id),
      userId: String(user.id),
      name: user.full_name,
      email: user.email,
      phone: undefined,
      avatarUrl: undefined,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  }

  async updateProfile(userId: number, payload: unknown): Promise<UserProfile> {
    const parsed = UpdateProfileDTOSchema.safeParse(payload);
    if (!parsed.success) {
      throw new AppError("Invalid profile data", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    this.info("Updating user profile", { userId });

    const user = await this.prisma.app_users.update({
      where: { id: userId },
      data: {
        full_name: parsed.data.fullName,
        updated_at: new Date(),
      }
    });

    return {
      id: String(user.id),
      userId: String(user.id),
      name: user.full_name,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  }

  async getUserStats(userId: number): Promise<UserStatsDTO> {
    this.info("Getting user stats", { userId });

    // Get mock test attempts stats
    const attemptStats = await this.prisma.mock_test_attempts.aggregate({
      where: { user_id: userId },
      _count: { id: true },
      _sum: { score: true },
      _max: { score: true },
    });

    const completedAttempts = await this.prisma.mock_test_attempts.findMany({
      where: { user_id: userId, status: "submitted" },
      select: { score: true }
    });

    const totalMocksTaken = attemptStats._count.id || 0;
    const totalMocksCompleted = completedAttempts.length;
    const averageScore = totalMocksCompleted > 0
      ? completedAttempts.reduce((sum, a) => sum + Number(a.score), 0) / totalMocksCompleted
      : 0;

    // Get answer-level stats
    const answerStats = await this.prisma.mock_test_answers.aggregate({
      where: {
        attempt_id: { in: await this.getAttemptIds(userId) }
      },
      _count: { id: true },
      _sum: { is_correct: true }
    });

    const totalAnswered = answerStats._count.id || 0;
    const totalCorrect = Number(answerStats._sum.is_correct) || 0;
    const correctRate = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    // Get categories studied
    const categories = await this.prisma.$queryRaw<{ syllabus_category: string }[]>`
      SELECT DISTINCT q.syllabus_category
      FROM mock_test_answers a
      JOIN loksewa_questions q ON q.id = a.question_id
      WHERE a.attempt_id IN (SELECT id FROM mock_test_attempts WHERE user_id = ${userId})
      AND q.syllabus_category != ''
      ORDER BY q.syllabus_category ASC
    `;

    return {
      totalMocksTaken,
      totalMocksCompleted,
      averageScore: Math.round(averageScore * 100) / 100,
      correctRate: Math.round(correctRate * 100) / 100,
      totalQuestionsAnswered: totalAnswered,
      bestScore: Number(attemptStats._max.score) || 0,
      categoriesStudied: categories.map(c => c.syllabus_category),
    };
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    this.info("Getting user progress", { userId });

    const progress = await this.prisma.study_progress.findMany({
      where: { user_id: userId }
    });

    return progress.map(p => ({
      id: String(p.id),
      userId: String(p.user_id),
      topicId: String(p.topic_id),
      completionPercentage: Number(p.completion_percentage),
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));
  }

  async updateTopicProgress(
    userId: number,
    topicId: number,
    completionPercentage: number
  ): Promise<UserProgress> {
    this.info("Updating topic progress", { userId, topicId, completionPercentage });

    const progress = await this.prisma.study_progress.upsert({
      where: {
        user_id_topic_id: { user_id: userId, topic_id: topicId }
      },
      update: {
        completion_percentage: completionPercentage,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        topic_id: topicId,
        completion_percentage: completionPercentage,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    return {
      id: String(progress.id),
      userId: String(progress.user_id),
      topicId: String(progress.topic_id),
      completionPercentage: Number(progress.completion_percentage),
      createdAt: new Date(progress.created_at),
      updatedAt: new Date(progress.updated_at),
    };
  }

  async getUserPreferences(userId: number): Promise<UserPreferences> {
    // Return default preferences - in production, store in database
    return {
      id: String(userId),
      userId: String(userId),
      language: "ne",
      aiEnabled: true,
      offlineMode: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updatePreferences(userId: number, payload: unknown): Promise<UserPreferences> {
    const parsed = UpdatePreferencesDTOSchema.safeParse(payload);
    if (!parsed.success) {
      throw new AppError("Invalid preferences data", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    // In production, store preferences in database
    this.info("Updating user preferences", { userId });

    return {
      id: String(userId),
      userId: String(userId),
      language: parsed.data.language || "ne",
      aiEnabled: parsed.data.aiEnabled ?? true,
      offlineMode: parsed.data.offlineMode ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  completionRate(completed: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((completed / total) * 10000) / 100;
  }

  private async getAttemptIds(userId: number): Promise<number[]> {
    const attempts = await this.prisma.mock_test_attempts.findMany({
      where: { user_id: userId },
      select: { id: true }
    });
    return attempts.map(a => a.id);
  }
}

export const userService = new UserService();