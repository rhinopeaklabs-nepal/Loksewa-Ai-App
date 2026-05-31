import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { StudyProgress } from "../entities/StudyProgress";

export interface StudyProgressRepository extends BaseRepository<StudyProgress> {
  findByUser(userId: string): Promise<StudyProgress[]>;
}
