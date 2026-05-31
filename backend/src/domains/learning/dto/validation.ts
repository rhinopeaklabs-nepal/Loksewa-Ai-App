import { z } from "zod";

export const GenerateLessonSchema = z.object({
  userId: z.string().min(1),
  topicId: z.string().min(1),
  questionId: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  forceRegenerate: z.boolean().default(false)
});

export const ReviewFlashcardSchema = z.object({
  userId: z.string().min(1),
  flashcardId: z.string().min(1),
  quality: z.number().int().min(0).max(5)
});

export const UpdateProgressSchema = z.object({
  userId: z.string().min(1),
  topicId: z.string().min(1),
  completionPercentage: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100).optional()
});

export const FlashcardListQuerySchema = z.object({
  userId: z.string().min(1),
  topicId: z.string().optional(),
  dueOnly: z.boolean().default(true),
  limit: z.number().int().min(1).max(100).default(20)
});

export const CreateTopicNoteSchema = z.object({
  userId: z.string().min(1),
  topicId: z.string().min(1),
  note: z.string().min(1).max(10000)
});

export const UpdateTopicNoteSchema = z.object({
  id: z.string().min(1),
  note: z.string().min(1).max(10000)
});

export type GenerateLessonInput = z.infer<typeof GenerateLessonSchema>;
export type ReviewFlashcardInput = z.infer<typeof ReviewFlashcardSchema>;
export type UpdateProgressInput = z.infer<typeof UpdateProgressSchema>;
export type FlashcardListQuery = z.infer<typeof FlashcardListQuerySchema>;
export type CreateTopicNoteInput = z.infer<typeof CreateTopicNoteSchema>;
export type UpdateTopicNoteInput = z.infer<typeof UpdateTopicNoteSchema>;