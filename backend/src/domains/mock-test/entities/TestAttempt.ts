import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface TestAttempt extends BaseEntity {
  mockTestId: string;
  userId: string;
  startedAt: Date;
  submittedAt?: Date;
  status: "in_progress" | "submitted" | "expired";
}
