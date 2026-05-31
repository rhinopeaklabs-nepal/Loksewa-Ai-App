import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { MockTest } from "../entities/MockTest";

export interface MockTestRepository extends BaseRepository<MockTest> {
  findPublished(): Promise<MockTest[]>;
}
