export class ScanWorker {
  readonly name = "ScanWorker";

  async process(jobId: string): Promise<{ jobId: string; status: "completed" }> {
    return { jobId, status: "completed" };
  }
}
