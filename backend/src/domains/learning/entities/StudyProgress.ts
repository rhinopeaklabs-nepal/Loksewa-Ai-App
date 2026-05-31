import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface StudyProgress extends BaseEntity {
  userId: string;
  topicId: string;
  completedLessons: number;
  accuracy: number;
}
