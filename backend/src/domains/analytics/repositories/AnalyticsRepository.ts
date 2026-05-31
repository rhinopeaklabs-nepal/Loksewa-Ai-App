import type { DailyStats } from "../entities/DailyStats";
import type { StudyStreak } from "../entities/StudyStreak";
import type { WeaknessArea } from "../entities/WeaknessArea";

export interface AnalyticsRepository {
  getDailyStats(userId: string): Promise<DailyStats[]>;
  getWeaknessAreas(userId: string): Promise<WeaknessArea[]>;
  getStudyStreak(userId: string): Promise<StudyStreak | null>;
}
