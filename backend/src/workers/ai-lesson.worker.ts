import { Worker, type ConnectionOptions, type Job } from "bullmq";
import { LearningEngineService } from "../domains/learning/services/LearningEngineService";

export interface AiLessonJobData {
  userId: string;
  topicId: string;
  level: "beginner" | "intermediate" | "advanced";
}

export const aiLessonWorker = {
  name: "ai-lesson.worker",
  queue: "learning"
};

export function createAiLessonWorker(connection: ConnectionOptions): Worker<AiLessonJobData> {
  const service = new LearningEngineService();
  return new Worker<AiLessonJobData>(
    aiLessonWorker.queue,
    async (job: Job<AiLessonJobData>) => service.generateLesson(job.data),
    { connection }
  );
}
