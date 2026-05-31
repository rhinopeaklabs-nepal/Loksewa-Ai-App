import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface SubTopic extends BaseEntity {
  topicId: string;
  title: string;
  order: number;
}
