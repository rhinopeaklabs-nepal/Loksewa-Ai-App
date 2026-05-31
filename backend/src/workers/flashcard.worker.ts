import { Worker, type ConnectionOptions, type Job } from "bullmq";
import { FlashcardService, type FlashcardReviewState } from "../domains/learning/services/FlashcardService";

export interface FlashcardReviewJobData {
  flashcardId: string;
  quality: number;
  state: FlashcardReviewState;
}

export const flashcardWorker = {
  name: "flashcard.worker",
  queue: "flashcards"
};

export function createFlashcardWorker(connection: ConnectionOptions): Worker<FlashcardReviewJobData> {
  const service = new FlashcardService();
  return new Worker<FlashcardReviewJobData>(
    flashcardWorker.queue,
    async (job: Job<FlashcardReviewJobData>) => ({
      flashcardId: job.data.flashcardId,
      review: service.review(job.data.state, job.data.quality)
    }),
    { connection }
  );
}
