import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface RefreshToken extends BaseEntity {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
}
