import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface MockTest extends BaseEntity {
  title: string;
  examLevel: string;
  durationMinutes: number;
  totalQuestions: number;
  negativeMarking?: number;
  published: boolean;
}
