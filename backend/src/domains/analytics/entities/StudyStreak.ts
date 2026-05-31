import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface StudyStreak extends BaseEntity {
  userId: string;
  currentDays: number;
  bestDays: number;
  lastStudyDate?: string;
}
