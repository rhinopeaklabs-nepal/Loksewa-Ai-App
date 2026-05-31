import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface QuestionSource extends BaseEntity {
  questionId: string;
  sourceName: string;
  sourceUrl?: string;
  sourceYear?: number;
}
