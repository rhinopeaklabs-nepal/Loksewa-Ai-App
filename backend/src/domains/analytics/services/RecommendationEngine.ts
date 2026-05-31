import { BaseService } from "../../../core/base/BaseService";
import type { RecommendationDTO } from "../dto/RecommendationDTO";
import type { WeaknessArea } from "../entities/WeaknessArea";

export class RecommendationEngine extends BaseService {
  constructor() {
    super("RecommendationEngine");
  }

  recommend(userId: string, weaknesses: WeaknessArea[]): RecommendationDTO[] {
    return weaknesses
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3)
      .map((weakness) => ({
        userId,
        topicId: weakness.topicId,
        reason: `Accuracy is ${weakness.accuracy}%, so this topic should be revised first.`,
        priority: weakness.priority
      }));
  }
}
