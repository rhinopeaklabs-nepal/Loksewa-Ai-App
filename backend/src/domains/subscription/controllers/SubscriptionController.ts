import { BaseController } from "../../../core/base/BaseController";

export class SubscriptionController extends BaseController {
  async getPlans() {
    return [
      {
        id: "free",
        code: "free",
        name: "Free",
        price: 0,
        currency: "NPR",
        features: ["Verified question search", "Limited mock tests"]
      },
      {
        id: "premium",
        code: "premium",
        name: "Premium",
        price: 499,
        currency: "NPR",
        features: ["Unlimited mock tests", "AI learning engine", "Advanced analytics"]
      }
    ];
  }

  async getCurrent() {
    return {
      planId: "free",
      status: "active",
      features: ["Verified question search", "Limited mock tests"]
    };
  }

  async checkout(payload: { planId: string; successUrl?: string; cancelUrl?: string }) {
    return {
      checkoutId: `checkout_${payload.planId}`,
      planId: payload.planId,
      status: "created",
      successUrl: payload.successUrl,
      cancelUrl: payload.cancelUrl
    };
  }

  routes() {
    return {
      plans: "GET /api/subscription/plans",
      current: "GET /api/subscription/current",
      checkout: "POST /api/subscription/checkout"
    };
  }
}
