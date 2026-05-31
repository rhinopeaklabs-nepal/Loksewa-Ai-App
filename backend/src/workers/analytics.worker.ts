import { Worker, type ConnectionOptions, type Job } from "bullmq";

export interface AnalyticsJobData {
  userId: string;
  period: "7d" | "30d" | "90d" | "1y";
}

export const analyticsWorker = {
  name: "analytics.worker",
  queue: "analytics"
};

export function createAnalyticsWorker(connection: ConnectionOptions): Worker<AnalyticsJobData> {
  return new Worker<AnalyticsJobData>(
    analyticsWorker.queue,
    async (job: Job<AnalyticsJobData>) => ({
      userId: job.data.userId,
      period: job.data.period,
      aggregatedAt: new Date().toISOString()
    }),
    { connection }
  );
}
