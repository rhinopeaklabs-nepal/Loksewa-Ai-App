import { BaseController } from "../../../core/base/BaseController";
import type { LearningEngineService } from "../services/LearningEngineService";
import type { FlashcardService } from "../services/FlashcardService";
import type { ProgressTrackingService } from "../services/ProgressTrackingService";
import type { TopicNoteService } from "../services/TopicNoteService";
import {
  GenerateLessonSchema,
  ReviewFlashcardSchema,
  UpdateProgressSchema,
  FlashcardListQuerySchema,
  CreateTopicNoteSchema,
  UpdateTopicNoteSchema
} from "../dto/validation";

export class LearningController extends BaseController {
  constructor(
    private readonly learningEngine: LearningEngineService,
    private readonly flashcardService: FlashcardService,
    private readonly progressService: ProgressTrackingService,
    private readonly topicNoteService: TopicNoteService
  ) {
    super();
  }

  async generateLesson(payload: unknown) {
    const input = GenerateLessonSchema.parse(payload);
    const lesson = await this.learningEngine.generateLesson(input);
    return this.ok(lesson);
  }

  async getLesson(questionId: string) {
    const lesson = await this.learningEngine.getLessonByQuestion(questionId);
    return this.ok(lesson);
  }

  async listFlashcards(query: unknown) {
    const { userId, topicId, dueOnly, limit } = FlashcardListQuerySchema.parse(query);
    const cards = await this.flashcardService.getFlashcards({ userId, topicId, dueOnly, limit });
    return this.ok(cards);
  }

  async reviewFlashcard(payload: unknown) {
    const { userId, flashcardId, quality } = ReviewFlashcardSchema.parse(payload);
    const result = await this.flashcardService.reviewFlashcard({ userId, flashcardId, quality });
    return this.ok(result);
  }

  async getProgress(userId: string) {
    const progress = await this.progressService.getUserProgress(userId);
    return this.ok(progress);
  }

  async updateProgress(payload: unknown) {
    const input = UpdateProgressSchema.parse(payload);
    const progress = await this.progressService.updateProgress(input);
    return this.ok(progress);
  }

  async createTopicNote(payload: unknown) {
    const input = CreateTopicNoteSchema.parse(payload);
    const note = await this.topicNoteService.createNote(input);
    return this.created(note);
  }

  async updateTopicNote(payload: unknown) {
    const input = UpdateTopicNoteSchema.parse(payload);
    const note = await this.topicNoteService.updateNote(input);
    return this.ok(note);
  }

  async getTopicNotes(userId: string, topicId: string) {
    const notes = await this.topicNoteService.getNotesByTopic(userId, topicId);
    return this.ok(notes);
  }

  routes() {
    return {
      generateLesson: "POST /api/learning/lessons/generate",
      getLesson: "GET /api/learning/lessons/:questionId",
      listFlashcards: "GET /api/learning/flashcards",
      reviewFlashcard: "POST /api/learning/flashcards/:id/review",
      getProgress: "GET /api/learning/progress",
      updateProgress: "PUT /api/learning/progress",
      createTopicNote: "POST /api/learning/notes",
      updateTopicNote: "PUT /api/learning/notes",
      getTopicNotes: "GET /api/learning/notes/:topicId"
    };
  }
}