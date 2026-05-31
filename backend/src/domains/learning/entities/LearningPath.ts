import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface LearningPath extends BaseEntity {
  userId: string;
  title: string;
  topicIds: string[];
  targetExamDate?: Date;
}
