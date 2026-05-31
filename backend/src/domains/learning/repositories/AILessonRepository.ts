import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { AILesson } from "../entities/AILesson";

export interface AILessonRepository extends BaseRepository<AILesson> {
  findByTopic(topicId: string): Promise<AILesson[]>;
}
