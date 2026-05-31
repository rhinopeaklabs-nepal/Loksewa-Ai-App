import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface Answer extends BaseEntity {
  questionId: string;
  correctOption: string;
  explanation?: string;
  sourceId?: string;
}
