import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface Plan extends BaseEntity {
  code: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
}
