import { BaseService } from "../../../core/base/BaseService";
import { randomUUID } from "node:crypto";
import type { ScanRequestDTO } from "../dto/ScanRequestDTO";
import type { ScanJob } from "../entities/ScanJob";
import type { ScanResult } from "../entities/ScanResult";

export class ScanService extends BaseService {
  constructor() {
    super("ScanService");
  }

  createJob(payload: ScanRequestDTO): ScanJob {
    const now = new Date();
    return {
      id: randomUUID(),
      userId: payload.userId,
      imageKey: payload.imageKey,
      status: "queued",
      createdAt: now,
      updatedAt: now
    };
  }

  completeJob(job: ScanJob, extractedText: string, matchedQuestionId?: string): ScanResult {
    const now = new Date();
    job.status = "completed";
    job.updatedAt = now;
    return {
      id: randomUUID(),
      scanJobId: job.id,
      extractedText,
      answerSource: matchedQuestionId ? "verified_db" : "uncertain",
      matchedQuestionId,
      createdAt: now,
      updatedAt: now
    };
  }
}
