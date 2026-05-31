import { BaseService } from "../../../core/base/BaseService";
import { aiConfig, generateWithLocalModel } from "../../../config/ai";
import type { TutorContext } from "../entities/TutorContext";

export class ResponseGenerator extends BaseService {
  constructor() {
    super("ResponseGenerator");
  }

  async generate(context: TutorContext): Promise<string> {
    if (context.retrievedDocuments.length === 0) {
      return "I could not find verified local context for this question, so I will not guess. Please check official sources or try a more specific Loksewa topic.";
    }

    const fallback = [
      "Based on verified local context:",
      ...context.retrievedDocuments.map((document, index) => `${index + 1}. ${document}`),
      "Please verify date-sensitive facts with official Rajpatra or authoritative textbooks."
    ].join("\n");
    const prompt = [
      "You are a conservative Loksewa AI tutor.",
      "Answer only from this verified context and clearly mention if facts should be checked with official sources.",
      `Student question: ${context.question ?? ""}`,
      "Verified context:",
      context.retrievedDocuments.map((document) => `- ${document}`).join("\n")
    ].join("\n\n");

    return (
      (await generateWithLocalModel(prompt, {
        model: aiConfig.tutorModel,
        temperature: 0.1
      })) ?? fallback
    );
  }
}
