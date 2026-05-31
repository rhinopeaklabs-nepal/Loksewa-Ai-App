import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface Payment extends BaseEntity {
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  provider: string;
  status: "pending" | "paid" | "failed" | "refunded";
}
