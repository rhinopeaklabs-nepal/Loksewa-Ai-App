import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface UserPreferences extends BaseEntity {
  userId: string;
  language: "ne" | "en";
  aiEnabled: boolean;
  offlineMode: boolean;
}
