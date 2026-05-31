import type { Answer } from "./Answer";

export interface VerifiedAnswer extends Answer {
  verifiedBy: string;
  verificationStatus: "verified" | "needs_review" | "rejected";
  verifiedAt: Date;
}
