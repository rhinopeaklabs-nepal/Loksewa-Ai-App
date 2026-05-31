export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export interface AIConfig {
  provider: "openai" | "anthropic" | "ollama" | "local-first";
  openAI?: {
    apiKey: string;
    organization?: string;
    defaultModel: string;
  };
  anthropic?: {
    apiKey: string;
    defaultModel: string;
  };
  ollama?: OllamaConfig;
  lessonModel: string;
  tutorModel: string;
  requireVerifiedContext: boolean;
}

function getOllamaConfig(): OllamaConfig {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
    model: process.env.OLLAMA_MODEL ?? "qwen2.5:3b"
  };
}

export function getAIConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER ?? "ollama") as AIConfig["provider"];

  const config: AIConfig = {
    provider,
    lessonModel: process.env.AI_LESSON_MODEL ?? "qwen2.5:3b",
    tutorModel: process.env.AI_TUTOR_MODEL ?? "qwen2.5:3b",
    requireVerifiedContext: process.env.AI_REQUIRE_VERIFIED_CONTEXT !== "false"
  };

  if (provider === "openai") {
    config.openAI = {
      apiKey: process.env.OPENAI_API_KEY ?? "",
      organization: process.env.OPENAI_ORG,
      defaultModel: process.env.OPENAI_DEFAULT_MODEL ?? "gpt-4o"
    };
  } else if (provider === "anthropic") {
    config.anthropic = {
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
      defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL ?? "claude-sonnet-4-20250514"
    };
  } else if (provider === "ollama") {
    config.ollama = getOllamaConfig();
  }

  return config;
}

export const aiConfig = getAIConfig();

export interface LocalModelGenerationOptions {
  model?: string;
  temperature?: number;
  timeoutMs?: number;
}

export async function generateWithLocalModel(
  prompt: string,
  options: LocalModelGenerationOptions = {}
): Promise<string | null> {
  const ollama = getOllamaConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 30_000);

  try {
    const response = await fetch(`${ollama.baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: options.model ?? ollama.model,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.2
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { response?: string };
    return payload.response?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
