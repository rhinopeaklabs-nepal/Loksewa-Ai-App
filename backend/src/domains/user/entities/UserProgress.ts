import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface UserProgress extends BaseEntity {
  userId: string;
  topicId: string;
  completionPercentage: number;
}
