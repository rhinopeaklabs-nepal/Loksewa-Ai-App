export interface FeatureAccess {
  userId: string;
  feature: string;
  allowed: boolean;
  reason?: string;
}
