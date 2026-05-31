export interface RecommendationDTO {
  userId: string;
  topicId: string;
  reason: string;
  priority: "low" | "medium" | "high";
}
