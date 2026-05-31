import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface TopicNote extends BaseEntity {
  userId: string;
  topicId: string;
  note: string;
}
