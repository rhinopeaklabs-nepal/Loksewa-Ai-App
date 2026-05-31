import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface TestResult extends BaseEntity {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
}
