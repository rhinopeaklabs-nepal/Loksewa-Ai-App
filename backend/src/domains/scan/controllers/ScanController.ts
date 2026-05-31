import { BaseController } from "../../../core/base/BaseController";
import { randomUUID } from "node:crypto";

export class ScanController extends BaseController {
  private readonly jobs = new Map<string, Record<string, unknown>>();

  async createJob(payload: { imageUrl: string; subjectId?: string; options?: object }) {
    const id = randomUUID();
    const job = {
      id,
      imageUrl: payload.imageUrl,
      subjectId: payload.subjectId,
      options: payload.options ?? {},
      status: "queued",
      createdAt: new Date().toISOString()
    };
    this.jobs.set(id, job);
    return job;
  }

  async getResult(id: string) {
    const job = this.jobs.get(id);
    if (!job) throw new Error("Scan job not found");
    return {
      ...job,
      status: "completed",
      extractedText: "",
      answerSource: "uncertain",
      warning: "No OCR worker result has been stored for this scan yet."
    };
  }

  routes() {
    return {
      create: "POST /api/scan",
      result: "GET /api/scan/:id/result"
    };
  }
}
