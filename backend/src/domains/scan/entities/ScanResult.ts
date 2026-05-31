import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface ScanResult extends BaseEntity {
  scanJobId: string;
  extractedText: string;
  confidence?: number;
  answerSource: "verified_db" | "ai_assisted" | "ai_only" | "uncertain";
  matchedQuestionId?: string;
}
