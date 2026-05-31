import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface Subscription extends BaseEntity {
  userId: string;
  planId: string;
  status: "active" | "trialing" | "past_due" | "cancelled";
  currentPeriodEnd?: Date;
}
