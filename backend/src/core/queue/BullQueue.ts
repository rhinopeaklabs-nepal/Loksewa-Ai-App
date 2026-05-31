import { Queue, type ConnectionOptions, type JobsOptions } from "bullmq";
import { logger } from "../utils/logger";

export interface QueueJob<TPayload = unknown> {
  name: string;
  payload: TPayload;
  options?: JobsOptions;
}

export class BullQueue {
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly connection: ConnectionOptions = {
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD || undefined
  }) {}

  getQueue(name: string): Queue {
    const existing = this.queues.get(name);
    if (existing) return existing;

    const queue = new Queue(name, {
      connection: this.connection,
      prefix: process.env.BULLMQ_PREFIX ?? "loksewa"
    });
    this.queues.set(name, queue);
    return queue;
  }

  async enqueue<TPayload>(queueName: string, job: QueueJob<TPayload>): Promise<string> {
    const queue = this.getQueue(queueName);
    const created = await queue.add(job.name, job.payload, job.options);
    logger.info({ queueName, jobName: job.name, jobId: created.id }, "Queued job");
    return String(created.id);
  }

  async close(): Promise<void> {
    await Promise.all([...this.queues.values()].map((queue) => queue.close()));
  }
}

export const bullQueue = new BullQueue();
