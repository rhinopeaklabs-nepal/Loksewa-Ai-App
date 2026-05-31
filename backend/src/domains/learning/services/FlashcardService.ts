import { BaseService } from "../../../core/base/BaseService";
import type { Flashcard } from "../entities/Flashcard";
import type { FlashcardDTO } from "../dto/FlashcardDTO";

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm by Piotr Wozniak
 *
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect response, but upon seeing correct answer, remembered
 * 2 - Incorrect response, but correct answer seemed easy to recall
 * 3 - Correct response with serious difficulty
 * 4 - Correct response after hesitation
 * 5 - Perfect response
 */
interface SM2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

export interface FlashcardRepository {
  findById(id: string): Promise<Flashcard | null>;
  findByUser(userId: string, topicId?: string): Promise<Flashcard[]>;
  findDueForUser(userId: string, now: Date): Promise<Flashcard[]>;
  update(id: string, data: Partial<Flashcard>): Promise<Flashcard>;
}

export interface ReviewResult {
  flashcardId: string;
  nextReviewAt: Date;
  interval: number;
  easeFactor: number;
  quality: number;
}

export class FlashcardService extends BaseService {
  constructor(private readonly repository: FlashcardRepository) {
    super("FlashcardService");
  }

  /**
   * Get flashcards for a user, optionally filtered by topic
   */
  async getFlashcards(params: {
    userId: string;
    topicId?: string;
    dueOnly: boolean;
    limit: number;
  }): Promise<FlashcardDTO[]> {
    let flashcards: Flashcard[];

    if (params.dueOnly) {
      flashcards = await this.repository.findDueForUser(params.userId, new Date());
    } else if (params.topicId) {
      flashcards = await this.repository.findByUser(params.userId, params.topicId);
    } else {
      flashcards = await this.repository.findByUser(params.userId);
    }

    return flashcards.slice(0, params.limit).map(f => ({
      id: f.id,
      front: f.front,
      back: f.back,
      due: f.nextReviewAt ? new Date(f.nextReviewAt) <= new Date() : true
    }));
  }

  /**
   * Process a flashcard review using SM-2 algorithm
   */
  async reviewFlashcard(params: {
    userId: string;
    flashcardId: string;
    quality: number; // 0-5 SM-2 quality rating
  }): Promise<ReviewResult> {
    const flashcard = await this.repository.findById(params.flashcardId);

    if (!flashcard) {
      throw new Error(`Flashcard not found: ${params.flashcardId}`);
    }

    if (flashcard.userId !== params.userId) {
      throw new Error("Flashcard does not belong to user");
    }

    // Apply SM-2 algorithm
    const newState = this.calculateSM2(params.quality, flashcard);

    // Update the flashcard
    const updated = await this.repository.update(params.flashcardId, {
      easeFactor: newState.easeFactor,
      interval: newState.interval,
      repetitions: newState.repetitions,
      nextReviewAt: newState.nextReviewAt,
      lastReviewedAt: new Date()
    });

    this.log(
      `Reviewed flashcard ${params.flashcardId}: q=${params.quality}, ` +
      `next interval=${newState.interval} days, EF=${newState.easeFactor.toFixed(2)}`
    );

    return {
      flashcardId: params.flashcardId,
      nextReviewAt: newState.nextReviewAt,
      interval: newState.interval,
      easeFactor: newState.easeFactor,
      quality: params.quality
    };
  }

  /**
   * SM-2 Algorithm Implementation
   *
   * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
   * where EF' is new ease factor, q is quality (0-5)
   *
   * Interval calculation:
   * - If q < 3: repeat immediately (interval = 1)
   * - If repetitions = 0: interval = 1
   * - If repetitions = 1: interval = 6
   * - Otherwise: interval = previous interval * EF
   */
  private calculateSM2(
    quality: number,
    card: Flashcard
  ): SM2State {
    const currentEF = card.easeFactor ?? 2.5;
    const currentReps = card.repetitions ?? 0;
    const currentInterval = card.interval ?? 0;

    // Calculate new ease factor
    let newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // EF should not fall below 1.3
    newEF = Math.max(1.3, newEF);

    let newInterval: number;
    let newReps: number;

    // If quality < 3, reset the card (start over)
    if (quality < 3) {
      newReps = 0;
      newInterval = 1; // Review again tomorrow
    } else {
      newReps = currentReps + 1;

      if (newReps === 1) {
        newInterval = 1;
      } else if (newReps === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(currentInterval * newEF);
      }
    }

    // Calculate next review date
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

    return {
      easeFactor: Math.round(newEF * 100) / 100,
      interval: newInterval,
      repetitions: newReps,
      nextReviewAt
    };
  }

  /**
   * Get study statistics for a user
   */
  async getStudyStats(userId: string): Promise<{
    totalCards: number;
    dueCards: number;
    masteredCards: number;
    averageEaseFactor: number;
  }> {
    const flashcards = await this.repository.findByUser(userId);
    const now = new Date();

    const dueCards = flashcards.filter(f => f.nextReviewAt && new Date(f.nextReviewAt) <= now);
    const masteredCards = flashcards.filter(f => f.easeFactor >= 2.5 && f.interval >= 21);

    const avgEF = flashcards.length > 0
      ? flashcards.reduce((sum, f) => sum + (f.easeFactor ?? 2.5), 0) / flashcards.length
      : 2.5;

    return {
      totalCards: flashcards.length,
      dueCards: dueCards.length,
      masteredCards: masteredCards.length,
      averageEaseFactor: Math.round(avgEF * 100) / 100
    };
  }
}