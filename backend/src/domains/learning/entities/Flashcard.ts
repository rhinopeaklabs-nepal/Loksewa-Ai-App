import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface Flashcard extends BaseEntity {
  userId: string;
  questionId?: string;
  topicId: string;
  front: string;
  back: string;
  // SM-2 spaced repetition fields
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt?: Date;
  lastReviewedAt?: Date;
  // Metadata
  reviewCount?: number;
  lessonId?: string;
}