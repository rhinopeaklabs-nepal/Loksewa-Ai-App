import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface Session extends BaseEntity {
  userId: string;
  tokenHash: string;
  clientType: "mobile" | "admin";
  expiresAt: Date;
}
