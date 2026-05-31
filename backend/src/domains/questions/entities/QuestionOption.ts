import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface QuestionOption extends BaseEntity {
  questionId: string;
  label: "A" | "B" | "C" | "D";
  text: string;
}
