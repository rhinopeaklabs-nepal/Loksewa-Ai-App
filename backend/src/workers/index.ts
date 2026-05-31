import { aiLessonWorker } from "./ai-lesson.worker";
import { analyticsWorker } from "./analytics.worker";
import { flashcardWorker } from "./flashcard.worker";
import { notificationWorker } from "./notification.worker";
import { ocrWorker } from "./ocr.worker";
import { createAiLessonWorker } from "./ai-lesson.worker";
import { createAnalyticsWorker } from "./analytics.worker";
import { createFlashcardWorker } from "./flashcard.worker";
import { createNotificationWorker } from "./notification.worker";
import { createOcrWorker } from "./ocr.worker";
import type { ConnectionOptions, Worker } from "bullmq";

export const workers = [
  ocrWorker,
  aiLessonWorker,
  flashcardWorker,
  analyticsWorker,
  notificationWorker
];

export function createWorkers(connection: ConnectionOptions): Worker[] {
  return [
    createOcrWorker(connection),
    createAiLessonWorker(connection),
    createFlashcardWorker(connection),
    createAnalyticsWorker(connection),
    createNotificationWorker(connection)
  ];
}
