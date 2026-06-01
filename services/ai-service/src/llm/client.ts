// AI Service — LLM client (OpenAI-compatible interface for Qwen, Llama, etc.)
import OpenAI from "openai";
import { getConfig, logger } from "@loksewa/shared-utils";
import type { ChatMessage } from "@loksewa/shared-types";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  const config = getConfig();

  // OpenAI-compatible API; works with vLLM, Ollama, TGI, Qwen, etc.
  client = new OpenAI({
    apiKey: config.LLM_API_KEY || "no-key-needed-for-local",
    baseURL: config.LLM_BASE_URL,
    defaultHeaders: {
      "X-Service": "loksewa-ai-service",
    },
  });

  return client;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string[];
  stream?: boolean;
}

export interface CompletionResult {
  content: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  finish_reason: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<CompletionResult> {
  const config = getConfig();
  const model = options.model ?? config.LLM_DEFAULT_MODEL;
  const start = Date.now();

  const response = await getClient().chat.completions.create({
    model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1024,
    top_p: options.top_p ?? 0.9,
    stop: options.stop,
    stream: false,
  });

  const latency = Date.now() - start;
  const choice = response.choices[0];
  if (!choice) {
    throw new Error("No completion returned");
  }

  return {
    content: choice.message.content ?? "",
    model: response.model,
    prompt_tokens: response.usage?.prompt_tokens ?? 0,
    completion_tokens: response.usage?.completion_tokens ?? 0,
    total_tokens: response.usage?.total_tokens ?? 0,
    latency_ms: latency,
    finish_reason: choice.finish_reason,
  };
}

export async function* streamChatCompletion(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): AsyncGenerator<{ delta: string; finish_reason?: string }, CompletionResult, void> {
  const config = getConfig();
  const model = options.model ?? config.LLM_DEFAULT_MODEL;
  const start = Date.now();

  const stream = await getClient().chat.completions.create({
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1024,
    top_p: options.top_p ?? 0.9,
    stop: options.stop,
    stream: true,
  });

  let fullContent = "";
  let promptTokens = 0;
  let completionTokens = 0;
  let finishReason: string | undefined;

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    fullContent += delta;
    if (chunk.choices[0]?.finish_reason) {
      finishReason = chunk.choices[0].finish_reason;
    }
    if (chunk.usage) {
      promptTokens = chunk.usage.prompt_tokens ?? 0;
      completionTokens = chunk.usage.completion_tokens ?? 0;
    }
    yield { delta, finish_reason: finishReason };
  }

  const latency = Date.now() - start;
  return {
    content: fullContent,
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
    latency_ms: latency,
    finish_reason: finishReason ?? "stop",
  };
}

// Embeddings
export async function getEmbedding(text: string): Promise<number[]> {
  const config = getConfig();
  // Use OpenAI-compatible embeddings endpoint
  const response = await getClient().embeddings.create({
    model: config.EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0]!.embedding;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const config = getConfig();
  const response = await getClient().embeddings.create({
    model: config.EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}
