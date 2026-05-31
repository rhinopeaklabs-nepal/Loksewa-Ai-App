import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { Flashcard } from "../entities/Flashcard";

export interface FlashcardRepository extends BaseRepository<Flashcard> {
  findDueForUser(userId: string, now: Date): Promise<Flashcard[]>;
}
