export interface ScanResultDTO {
  scanJobId: string;
  extractedText: string;
  source: "verified_db" | "ai_assisted" | "ai_only" | "uncertain";
  matchedQuestionId?: string;
  warning?: string;
}
