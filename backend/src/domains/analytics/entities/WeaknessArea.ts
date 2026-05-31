import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface WeaknessArea extends BaseEntity {
  userId: string;
  topicId: string;
  accuracy: number;
  priority: "low" | "medium" | "high";
}
