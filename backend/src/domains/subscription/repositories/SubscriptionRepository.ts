import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { Subscription } from "../entities/Subscription";

export interface SubscriptionRepository extends BaseRepository<Subscription> {
  findActiveForUser(userId: string): Promise<Subscription | null>;
}
