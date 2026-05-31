import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { TestAttempt } from "../entities/TestAttempt";

export interface TestAttemptRepository extends BaseRepository<TestAttempt> {
  findActiveAttempt(userId: string, mockTestId: string): Promise<TestAttempt | null>;
}
