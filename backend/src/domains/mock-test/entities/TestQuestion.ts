import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface TestQuestion extends BaseEntity {
  mockTestId: string;
  questionId: string;
  orderIndex: number;
  marks: number;
}
