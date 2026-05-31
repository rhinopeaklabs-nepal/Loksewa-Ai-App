import type { LessonDTO } from "../dto/LessonDTO";

interface ParsedLesson {
  title: string;
  summary: string;
  content: string;
  examNotes: string;
  mnemonic: string;
  relatedQuestions: Array<{ question: string; correctOption: string; explanation: string }>;
  flashcards: Array<{ front: string; back: string }>;
  revisionSummary: string;
}

export class LessonParser {
  parse(raw: string): Omit<ParsedLesson, "title"> {
    const cleaned = this.stripMarkdownCodeBlocks(raw);
    const data = this.extractJSON(cleaned);

    if (!data) {
      return this.fallbackParse(cleaned);
    }

    return {
      title: data.title ?? "Generated Lesson",
      summary: data.summary ?? "",
      content: data.content ?? "",
      examNotes: data.examNotes ?? "",
      mnemonic: data.mnemonic ?? "",
      relatedQuestions: Array.isArray(data.relatedQuestions) ? data.relatedQuestions : [],
      flashcards: Array.isArray(data.flashcards)
        ? data.flashcards.map((f: { front?: string; back?: string; question?: string; answer?: string }) => ({
            front: f.front ?? f.question ?? "",
            back: f.back ?? f.answer ?? ""
          }))
        : [],
      revisionSummary: data.revisionSummary ?? ""
    };
  }

  parseWithContext(raw: string, topicId: string): LessonDTO {
    const parsed = this.parse(raw);
    return {
      id: this.generateId(),
      topicId,
      title: parsed.title,
      summary: parsed.summary,
      content: parsed.content
    };
  }

  private stripMarkdownCodeBlocks(text: string): string {
    return text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  private extractJSON(text: string): Record<string, unknown> | null {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  private fallbackParse(text: string): Omit<ParsedLesson, "title"> {
    const sentences = text.split(/\n+/).filter(Boolean);
    return {
      title: "Generated Lesson",
      summary: sentences.slice(0, 2).join(". ").slice(0, 240),
      content: text,
      examNotes: "",
      mnemonic: "",
      relatedQuestions: [],
      flashcards: [],
      revisionSummary: sentences.slice(0, 5).join("; ")
    };
  }

  private generateId(): string {
    return `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}