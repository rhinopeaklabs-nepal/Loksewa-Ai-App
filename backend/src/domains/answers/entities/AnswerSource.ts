import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface AnswerSource extends BaseEntity {
  name: string;
  license?: string;
  publicationYear?: number;
  pageNumber?: string;
}
