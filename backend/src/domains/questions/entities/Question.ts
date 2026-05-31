import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface Question extends BaseEntity {
  text: string;
  category: string;
  difficulty?: string;
  verified: boolean;
}
