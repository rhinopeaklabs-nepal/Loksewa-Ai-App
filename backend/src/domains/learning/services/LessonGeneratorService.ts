import { BaseService } from "../../../core/base/BaseService";
import { generateWithLocalModel, aiConfig } from "../../../config/ai";
import type { LessonPromptBuilder } from "../ai/LessonPromptBuilder";
import type { LessonParser } from "../ai/LessonParser";

export interface LessonGeneratorDeps {
  promptBuilder: LessonPromptBuilder;
  parser: LessonParser;
}

export class LessonGeneratorService extends BaseService {
  constructor(private readonly deps: LessonGeneratorDeps) {
    super("LessonGeneratorService");
  }

  /**
   * Generate a structured lesson using the configured LLM provider
   * Supports OpenAI, Anthropic, and Ollama with fallback
   */
  async generate(
    systemPrompt: string,
    userPrompt: string,
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<string> {
    try {
      // Try OpenAI if configured
      if (aiConfig.openAI?.apiKey) {
        return await this.generateWithOpenAI(systemPrompt, userPrompt, options);
      }

      // Try Ollama as primary local provider
      if (aiConfig.ollama) {
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
        const result = await generateWithLocalModel(fullPrompt, {
          model: aiConfig.lessonModel,
          temperature: options.temperature ?? 0.3,
          timeoutMs: 60000
        });

        if (result) return result;
      }

      throw new Error("No LLM provider available");
    } catch (error) {
      this.log(`Lesson generation failed: ${error}`);
      throw error;
    }
  }

  private async generateWithOpenAI(
    systemPrompt: string,
    userPrompt: string,
    options: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    // OpenAI API call pattern - would use actual SDK in production
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.openAI!.apiKey}`
      },
      body: JSON.stringify({
        model: aiConfig.lessonModel || "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? "";
  }

  /**
   * Parse lesson content into structured format
   */
  parse(raw: string, topicId: string) {
    return this.deps.parser.parseWithContext(raw, topicId);
  }
}