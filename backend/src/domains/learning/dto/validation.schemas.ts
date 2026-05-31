import { z } from "zod";

export const GenerateLessonInputSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  topicId: z.string().min(1, "topicId is required"),
  questionId: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  forceRegenerate: z.boolean().default(false)
});

export const ReviewFlashcardInputSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  flashcardId: z.string().min(1, "flashcardId is required"),
  quality: z.number().int().min(0).max(5, "quality must be 0-5 (SM-2 scale)")
});

export const UpdateProgressInputSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  topicId: z.string().min(1, "topicId is required"),
  completionPercentage: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100).optional()
});

export const FlashcardQuerySchema = z.object({
  userId: z.string().min(1),
  topicId: z.string().optional(),
  dueOnly: z.boolean().default(true),
  limit: z.number().int().min(1).max(100).default(20)
});

export type GenerateLessonInput = z.infer<typeof GenerateLessonInputSchema>;
export type ReviewFlashcardInput = z.infer<typeof ReviewFlashcardInputSchema>;
export type UpdateProgressInput = z.infer<typeof UpdateProgressInputSchema>;
export type FlashcardQuery = z.infer<typeof FlashcardQuerySchema>;