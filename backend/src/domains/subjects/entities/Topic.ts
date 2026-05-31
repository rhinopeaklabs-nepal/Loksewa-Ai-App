import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface Topic extends BaseEntity {
  subjectId: string;
  title: string;
  order: number;
}
