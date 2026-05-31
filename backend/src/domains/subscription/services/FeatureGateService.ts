import { BaseService } from "../../../core/base/BaseService";
import type { FeatureAccess } from "../entities/FeatureAccess";

export class FeatureGateService extends BaseService {
  private readonly featureMatrix: Record<string, string[]> = {
    free: ["verified_search", "limited_mock_tests"],
    basic: ["verified_search", "limited_mock_tests", "flashcards"],
    premium: ["verified_search", "unlimited_mock_tests", "flashcards", "ai_lessons", "analytics", "ai_tutor"]
  };

  constructor() {
    super("FeatureGateService");
  }

  allow(userId: string, feature: string, plan = "free"): FeatureAccess {
    const allowed = (this.featureMatrix[plan] ?? this.featureMatrix.free).includes(feature);
    return {
      userId,
      feature,
      allowed,
      reason: allowed ? undefined : `Feature ${feature} requires a higher subscription plan.`
    };
  }
}
