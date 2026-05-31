import { Worker, type ConnectionOptions, type Job } from "bullmq";

export interface NotificationJobData {
  userId: string;
  title: string;
  body: string;
}

export const notificationWorker = {
  name: "notification.worker",
  queue: "notifications"
};

export function createNotificationWorker(connection: ConnectionOptions): Worker<NotificationJobData> {
  return new Worker<NotificationJobData>(
    notificationWorker.queue,
    async (job: Job<NotificationJobData>) => ({
      userId: job.data.userId,
      delivered: false,
      queuedTitle: job.data.title,
      reason: "Push provider integration is configured at deployment time."
    }),
    { connection }
  );
}
