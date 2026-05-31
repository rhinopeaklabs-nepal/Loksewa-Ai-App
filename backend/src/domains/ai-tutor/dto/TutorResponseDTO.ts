export interface TutorResponseDTO {
  conversationId: string;
  messageId: string;
  content: string;
  citations: Array<{
    sourceName: string;
    sourceType: "question" | "topic" | "syllabus";
    title: string;
  }>;
  suggestions?: string[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessageAt: Date;
  messageCount: number;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  attachments?: Array<{ type: string; id: string }>;
}