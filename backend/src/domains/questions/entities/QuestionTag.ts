import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface QuestionTag extends BaseEntity {
  questionId: string;
  tag: string;
}
