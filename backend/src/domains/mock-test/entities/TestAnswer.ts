import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface TestAnswer extends BaseEntity {
  attemptId: string;
  questionId: string;
  selectedOption?: string;
  markedForReview: boolean;
}
