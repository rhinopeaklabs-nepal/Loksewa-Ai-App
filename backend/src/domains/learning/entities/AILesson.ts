import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface AILesson extends BaseEntity {
  questionId?: string;
  topicId: string;
  title: string;
  summary: string;
  content: string;
  level: "beginner" | "intermediate" | "advanced";
  examNotes?: string;
  mnemonic?: string;
  relatedQuestionsJson?: string;
  topicSummary?: string;
  cacheKey?: string;
  version?: number;
}