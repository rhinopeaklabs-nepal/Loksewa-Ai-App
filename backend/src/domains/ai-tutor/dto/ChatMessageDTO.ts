import { z } from "zod";

export const ChatMessageSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  conversationId: z.string().optional(),
  message: z.string().min(1).max(4000),
  attachments: z.array(z.object({
    type: z.enum(["question", "image", "topic"]),
    id: z.string()
  })).optional()
});

export const CreateConversationSchema = z.object({
  userId: z.string().min(1),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  title: z.string().min(1).max(300).optional()
});

export const GetConversationSchema = z.object({
  userId: z.string().min(1),
  conversationId: z.string().min(1)
});

export const ListConversationsSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0)
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type GetConversationInput = z.infer<typeof GetConversationSchema>;
export type ListConversationsInput = z.infer<typeof ListConversationsSchema>;