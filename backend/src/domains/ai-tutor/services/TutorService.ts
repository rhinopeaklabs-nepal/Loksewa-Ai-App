import { BaseService } from "../../../core/base/BaseService";
import type { TutorContext } from "../entities/TutorContext";
import { RAGPipeline } from "./RAGPipeline";
import { ResponseGenerator } from "./ResponseGenerator";
import { aiConfig } from "../../../config/ai";

export interface TutorConversationRepository {
  findById(id: string): Promise<{ id: string; userId: string; title: string; messageCount: number } | null>;
  findByUser(userId: string, limit: number, offset: number): Promise<Array<{ id: string; title: string; lastMessageAt?: Date; messageCount: number }>>;
  create(data: { userId: string; title?: string; subjectId?: string; topicId?: string }): Promise<{ id: string }>;
  incrementMessageCount(id: string): Promise<void>;
}

export interface TutorMessageRepository {
  create(data: { conversationId: string; role: "user" | "assistant"; content: string; attachmentsJson?: string }): Promise<{ id: string; createdAt: Date }>;
  findByConversation(conversationId: string, limit: number): Promise<Array<{ role: string; content: string; createdAt: Date }>>;
}

export interface VectorSearchClient {
  search(query: string, topK: number): Promise<Array<{ id: string; text: string; score: number }>>;
}

export interface LLMProvider {
  generate(messages: Array<{ role: string; content: string }>, options?: { temperature?: number; maxTokens?: number }): Promise<string>;
}

export interface ChatInput {
  userId: string;
  conversationId?: string;
  message: string;
  attachments?: Array<{ type: string; id: string }>;
}

export class TutorService extends BaseService {
  constructor(
    private readonly conversationRepo: TutorConversationRepository,
    private readonly messageRepo: TutorMessageRepository,
    private readonly ragPipeline: RAGPipeline,
    private readonly responseGenerator: ResponseGenerator
  ) {
    super("TutorService");
  }

  async chat(input: ChatInput) {
    // Step 1: Get or create conversation
    let conversationId = input.conversationId;
    if (!conversationId) {
      const newConv = await this.conversationRepo.create({
        userId: input.userId,
        title: input.message.slice(0, 50) + (input.message.length > 50 ? "..." : "")
      });
      conversationId = newConv.id;
    }

    // Step 2: Save user message
    const userMsg = await this.messageRepo.create({
      conversationId,
      role: "user",
      content: input.message,
      attachmentsJson: input.attachments ? JSON.stringify(input.attachments) : undefined
    });

    // Step 3: Build context using RAG pipeline
    const context = await this.ragPipeline.buildContext(input.userId, input.message);

    // Step 4: Get conversation history for context
    const history = await this.messageRepo.findByConversation(conversationId, 10);

    // Step 5: Generate response
    const response = await this.responseGenerator.generate({
      context,
      history,
      userId: input.userId
    });

    // Step 6: Save assistant message
    const assistantMsg = await this.messageRepo.create({
      conversationId,
      role: "assistant",
      content: response.content
    });

    // Update conversation message count
    await this.conversationRepo.incrementMessageCount(conversationId);

    return {
      conversationId,
      messageId: assistantMsg.id,
      content: response.content,
      citations: response.citations,
      suggestions: response.suggestions
    };
  }

  async getConversations(userId: string, limit = 20, offset = 0) {
    return this.conversationRepo.findByUser(userId, limit, offset);
  }

  async getMessages(conversationId: string, limit = 50) {
    return this.messageRepo.findByConversation(conversationId, limit);
  }
}