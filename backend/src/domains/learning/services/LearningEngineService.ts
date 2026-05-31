import { BaseService } from "../../../core/base/BaseService";
import { LessonPromptBuilder } from "../ai/LessonPromptBuilder";
import { LessonParser } from "../ai/LessonParser";
import { LessonCache } from "../ai/LessonCache";
import type { AILesson } from "../entities/AILesson";
import type { Flashcard } from "../entities/Flashcard";
import type { GenerateLessonDTO } from "../dto/GenerateLessonDTO";
import type { LessonDTO } from "../dto/LessonDTO";
import type { AIConfig } from "../../../config/ai";

/**
 * Step 1: Fetch Context
 * Step 2: RAG Pipeline
 * Step 3: Prompt Construction
 * Step 4: LLM Generation
 * Step 5: Parse & Structure
 * Step 6: Store & Cache
 * Step 7: Return Lesson
 */
export interface LessonContextData {
  questionText: string;
  correctOption: string;
  explanation: string;
  topicName: string;
  subjectName: string;
  beginnerNote: string;
  intermediateNote: string;
  advancedNote: string;
  relatedQuestions: Array<{ question: string; correctOption: string; explanation: string }>;
  loksewaFrequency?: number;
  examNotes?: string;
}

export interface AILessonRepository {
  findByQuestionId(questionId: string): Promise<AILesson | null>;
  create(lesson: Omit<AILesson, "id" | "createdAt" | "updatedAt">): Promise<AILesson>;
  update(id: string, data: Partial<AILesson>): Promise<AILesson>;
}

export interface FlashcardRepository {
  createMany(cards: Array<Omit<Flashcard, "id" | "createdAt" | "updatedAt">>): Promise<Flashcard[]>;
}

export interface VectorSearchClient {
  search(query: string, topK: number): Promise<Array<{ id: string; text: string; score: number }>>;
}

export interface LLMProvider {
  generate(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string>;
}

export class LearningEngineService extends BaseService {
  private readonly promptBuilder: LessonPromptBuilder;
  private readonly parser: LessonParser;
  private readonly cache: LessonCache;

  constructor(
    private readonly config: AIConfig,
    private readonly lessonRepository: AILessonRepository,
    private readonly flashcardRepository: FlashcardRepository,
    private readonly vectorSearch: VectorSearchClient,
    private readonly llmProvider: LLMProvider
  ) {
    super("LearningEngineService");
    this.promptBuilder = new LessonPromptBuilder();
    this.parser = new LessonParser();
    this.cache = new LessonCache(24);
  }

  async generateLesson(input: GenerateLessonDTO): Promise<LessonDTO> {
    this.log(`Starting lesson generation for topic: ${input.topicId}, level: ${input.level}`);

    // Step 6: Check cache first (before expensive generation)
    const cacheKey = this.buildCacheKey(input);
    const cached = this.cache.get(cacheKey);
    if (cached && !input.forceRegenerate) {
      this.log("Returning cached lesson");
      return cached;
    }

    // Steps 1-3: Fetch context, RAG, build prompt
    const context = await this.fetchContext(input);
    const ragContext = await this.runRAGPipeline(input.topicId);
    const combinedContext = this.mergeContext(context, ragContext);

    const systemPrompt = this.promptBuilder.buildSystemPrompt();
    const userPrompt = this.promptBuilder.buildUserPrompt(input, combinedContext);

    // Step 4: LLM Generation
    this.log("Generating lesson with LLM...");
    const rawResponse = await this.llmProvider.generate(
      `${systemPrompt}\n\n${userPrompt}`,
      { temperature: 0.3, maxTokens: 4000 }
    );

    // Step 5: Parse & Structure
    const parsedLesson = this.parser.parse(rawResponse);

    // Build lesson DTO
    const lessonDTO: LessonDTO = {
      id: `lesson_${Date.now()}`,
      topicId: input.topicId,
      title: parsedLesson.title,
      summary: parsedLesson.summary,
      content: parsedLesson.content
    };

    // Step 6: Store to DB and cache
    await this.storeLesson(input, parsedLesson);

    // Generate and store flashcards
    await this.generateFlashcards(input.userId, input.topicId, parsedLesson.flashcards);

    // Cache the result
    this.cache.set(cacheKey, lessonDTO);

    this.log("Lesson generation complete");
    return lessonDTO;
  }

  async getLessonByQuestion(questionId: string): Promise<LessonDTO | null> {
    const lesson = await this.lessonRepository.findByQuestionId(questionId);
    if (!lesson) return null;

    return {
      id: lesson.id,
      topicId: lesson.topicId,
      title: lesson.title,
      summary: lesson.summary,
      content: lesson.content
    };
  }

  private async fetchContext(input: GenerateLessonDTO): Promise<LessonContextData> {
    // Fetch from question bank, topic notes, related MCQs
    // This would use Prisma client in a real implementation
    return {
      questionText: "Sample question for topic",
      correctOption: "A",
      explanation: "This is the explanation",
      topicName: input.topicId,
      subjectName: "General Knowledge",
      beginnerNote: "Basic introduction",
      intermediateNote: "Intermediate details",
      advancedNote: "Advanced concepts",
      relatedQuestions: []
    };
  }

  private async runRAGPipeline(topicId: string): Promise<{ retrievedText: string }[]> {
    try {
      const results = await this.vectorSearch.search(topicId, 5);
      return results.map(r => ({ retrievedText: r.text }));
    } catch (error) {
      this.log(`RAG pipeline error: ${error}`);
      return [];
    }
  }

  private mergeContext(context: LessonContextData, _ragResults: { retrievedText: string }[]): LessonContextData {
    // In a real implementation, merge RAG results into context
    return context;
  }

  private async storeLesson(
    input: GenerateLessonDTO,
    parsed: {
      title: string;
      summary: string;
      content: string;
      examNotes: string;
      mnemonic: string;
      relatedQuestions: Array<{ question: string; correctOption: string; explanation: string }>;
      revisionSummary: string;
    }
  ): Promise<void> {
    await this.lessonRepository.create({
      questionId: input.questionId ?? "",
      topicId: input.topicId,
      title: parsed.title,
      summary: parsed.summary,
      content: parsed.content,
      level: input.level,
      examNotes: parsed.examNotes,
      mnemonic: parsed.mnemonic,
      relatedQuestionsJson: JSON.stringify(parsed.relatedQuestions),
      topicSummary: parsed.revisionSummary
    });
  }

  private async generateFlashcards(
    userId: string,
    topicId: string,
    flashcards: Array<{ front: string; back: string }>
  ): Promise<void> {
    if (flashcards.length === 0) return;

    const cards = flashcards.map(f => ({
      userId,
      topicId,
      front: f.front,
      back: f.back,
      // SM-2 initial values
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewAt: new Date()
    }));

    await this.flashcardRepository.createMany(cards);
  }

  private buildCacheKey(input: GenerateLessonDTO): string {
    return `lesson:${input.topicId}:${input.questionId ?? "general"}:${input.level}`;
  }
}