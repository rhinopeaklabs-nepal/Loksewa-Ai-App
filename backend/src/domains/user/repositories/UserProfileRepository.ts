import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { UserProfile } from "../entities/UserProfile";

export interface UserProfileRepository extends BaseRepository<UserProfile> {
  findByUserId(userId: string): Promise<UserProfile | null>;
}
