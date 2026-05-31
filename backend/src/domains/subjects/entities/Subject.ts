import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface Subject extends BaseEntity {
  name: string;
  slug: string;
  order: number;
}
