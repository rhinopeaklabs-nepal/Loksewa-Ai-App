import { BaseController } from "../../../core/base/BaseController";
import { randomUUID } from "node:crypto";

export class TutorController extends BaseController {
  private readonly conversations = new Map<string, Record<string, unknown>>();

  async chat(payload: { message: string; conversationId?: string; context?: Record<string, unknown> }) {
    const conversationId = payload.conversationId ?? randomUUID();
    const response = {
      conversationId,
      message: "I can help with verified Loksewa study context. Please verify date-sensitive facts with official sources.",
      citations: [],
      context: payload.context ?? {}
    };
    this.conversations.set(conversationId, {
      id: conversationId,
      lastMessage: payload.message,
      updatedAt: new Date().toISOString()
    });
    return response;
  }

  async getConversations(query: { page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const items = [...this.conversations.values()];
    return {
      page,
      per_page: limit,
      total: items.length,
      items: items.slice((page - 1) * limit, page * limit)
    };
  }

  async getConversationById(id: string) {
    const conversation = this.conversations.get(id);
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
  }

  async getConversationMessages(id: string) {
    const conversation = await this.getConversationById(id);
    return {
      conversation,
      messages: []
    };
  }

  routes() {
    return {
      chat: "POST /api/tutor/chat",
      conversations: "GET /api/tutor/conversations"
    };
  }
}
