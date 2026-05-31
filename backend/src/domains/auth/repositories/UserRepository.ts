import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { User } from "../entities/User";

export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
