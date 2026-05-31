import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface UserProfile extends BaseEntity {
  userId: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
}
