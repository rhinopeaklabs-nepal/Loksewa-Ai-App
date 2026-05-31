export interface VerifyAnswerDTO {
  questionId: string;
  status: "verified" | "needs_review" | "rejected";
  verifier: string;
  notes?: string;
}
