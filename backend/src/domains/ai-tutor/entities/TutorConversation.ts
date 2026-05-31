import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface TutorConversation extends BaseEntity {
  userId: string;
  title: string;
  lastMessageAt?: Date;
}
