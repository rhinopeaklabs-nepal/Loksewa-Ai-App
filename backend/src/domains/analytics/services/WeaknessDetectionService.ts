import { BaseService } from "../../../core/base/BaseService";

export class WeaknessDetectionService extends BaseService {
  constructor() {
    super("WeaknessDetectionService");
  }

  priorityFromAccuracy(accuracy: number): "low" | "medium" | "high" {
    if (accuracy < 50) return "high";
    if (accuracy < 75) return "medium";
    return "low";
  }
}
