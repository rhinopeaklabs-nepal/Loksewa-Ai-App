import { BaseService } from "../../../core/base/BaseService";
import type { TopicNote } from "../entities/TopicNote";

export interface TopicNoteRepository {
  findById(id: string): Promise<TopicNote | null>;
  findByUserAndTopic(userId: string, topicId: string): Promise<TopicNote[]>;
  create(data: Omit<TopicNote, "id" | "createdAt" | "updatedAt">): Promise<TopicNote>;
  update(id: string, data: Partial<TopicNote>): Promise<TopicNote>;
  delete(id: string): Promise<void>;
}

export interface CreateNoteInput {
  userId: string;
  topicId: string;
  note: string;
  level?: "beginner" | "intermediate" | "advanced";
}

export interface UpdateNoteInput {
  id: string;
  note: string;
}

export class TopicNoteService extends BaseService {
  constructor(private readonly repository: TopicNoteRepository) {
    super("TopicNoteService");
  }

  async createNote(input: CreateNoteInput): Promise<TopicNote> {
    const note = await this.repository.create({
      userId: input.userId,
      topicId: input.topicId,
      note: input.note,
      level: input.level ?? "intermediate"
    });

    this.log(`Created topic note for user ${input.userId}, topic ${input.topicId}`);
    return note;
  }

  async updateNote(input: UpdateNoteInput): Promise<TopicNote> {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new Error(`Topic note not found: ${input.id}`);
    }

    const updated = await this.repository.update(input.id, { note: input.note });
    this.log(`Updated topic note ${input.id}`);
    return updated;
  }

  async deleteNote(id: string): Promise<void> {
    await this.repository.delete(id);
    this.log(`Deleted topic note ${id}`);
  }

  async getNotesByTopic(userId: string, topicId: string): Promise<TopicNote[]> {
    return this.repository.findByUserAndTopic(userId, topicId);
  }

  async getAllUserNotes(userId: string): Promise<TopicNote[]> {
    // Get all notes for a user across all topics
    const allTopics = await this.repository.findByUserAndTopic(userId, "");
    return allTopics;
  }
}