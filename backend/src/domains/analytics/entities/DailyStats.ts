import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface DailyStats extends BaseEntity {
  userId: string;
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  studyMinutes: number;
}
