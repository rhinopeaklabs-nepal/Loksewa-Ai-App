/**
 * Subscription plan types
 * Defines the available subscription tiers
 */
export enum SubscriptionPlan {
  /** Free tier with basic features */
  Free = "free",
  /** Basic tier with standard features */
  Basic = "basic",
  /** Premium tier with full features */
  Premium = "premium"
}

/**
 * Plan features (bitmask for efficient checking)
 */
export const PLAN_FEATURES = {
  [SubscriptionPlan.Free]: {
    mockTests: 5,
    aiTutor: false,
    analytics: false,
    flashcardLimit: 50
  },
  [SubscriptionPlan.Basic]: {
    mockTests: 50,
    aiTutor: true,
    analytics: true,
    flashcardLimit: 500
  },
  [SubscriptionPlan.Premium]: {
    mockTests: Infinity,
    aiTutor: true,
    analytics: true,
    flashcardLimit: Infinity
  }
} as const;

/**
 * Check if a plan has a specific feature
 */
export function planHasFeature(
  plan: SubscriptionPlan,
  feature: keyof (typeof PLAN_FEATURES)[SubscriptionPlan]
): boolean {
  const value = PLAN_FEATURES[plan][feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return Boolean(value);
}