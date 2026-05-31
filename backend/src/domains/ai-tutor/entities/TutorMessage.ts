import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface TutorMessage extends BaseEntity {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  sourceIds?: string[];
}
