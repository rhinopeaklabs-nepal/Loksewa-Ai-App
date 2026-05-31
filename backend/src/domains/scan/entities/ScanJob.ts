import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface ScanJob extends BaseEntity {
  userId: string;
  imageKey?: string;
  status: "queued" | "processing" | "completed" | "failed";
  errorMessage?: string;
}
