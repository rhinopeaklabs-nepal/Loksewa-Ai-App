import { BaseService } from "../../../core/base/BaseService";
import type { Subscription } from "../entities/Subscription";

export class SubscriptionService extends BaseService {
  constructor() {
    super("SubscriptionService");
  }

  isActive(subscription: Subscription, now = new Date()): boolean {
    if (!["active", "trialing"].includes(subscription.status)) return false;
    return !subscription.currentPeriodEnd || subscription.currentPeriodEnd > now;
  }
}
