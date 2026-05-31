import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { ScanJob } from "../entities/ScanJob";

export interface ScanJobRepository extends BaseRepository<ScanJob> {
  findPending(limit: number): Promise<ScanJob[]>;
}
