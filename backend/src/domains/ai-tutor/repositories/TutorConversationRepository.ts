import type { BaseRepository } from "../../../core/base/BaseRepository";
import type { TutorConversation } from "../entities/TutorConversation";

export interface TutorConversationRepository extends BaseRepository<TutorConversation> {
  findByUser(userId: string): Promise<TutorConversation[]>;
}
