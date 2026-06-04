// AI Service — Context Builder (assembles the prompt for the LLM)
import type { ChatMessage, ChatRequest, Language, UserProfile, Memory } from "@loksewa/shared-types";
import { renderPrompt, getPrompt } from "../prompts/templates.js";
import { retrieveKnowledge, retrieveUserMemories, buildContextBlock, buildCitations, type KnowledgeChunk } from "../rag/retriever.js";
import { logger } from "@loksewa/shared-utils";

export interface ContextInput {
  user_id: string;
  user_profile?: UserProfile;
  user_memories?: Memory[];
  user_skill_summary?: { topic: string; score: number }[];
  query: string;
  language: Language;
  mode?: NonNullable<ChatRequest["context"]>["mode"];
  retrieved_context?: string;
  recent_messages?: ChatMessage[];
}

export interface BuiltContext {
  system_prompt: string;
  messages: ChatMessage[];
  retrieved_chunks: KnowledgeChunk[];
  citations: ReturnType<typeof buildCitations>;
  total_tokens_estimate: number;
}

export async function buildContext(input: ContextInput): Promise<BuiltContext> {
  const startTime = Date.now();

  // 1. Retrieve knowledge in parallel with memory
  const [knowledgeChunks, memoryChunks] = await Promise.all([
    retrieveKnowledge(input.query, { limit: 5, scoreThreshold: 0.55 }),
    retrieveUserMemories(input.user_id, input.query, 3),
  ]);

  const allChunks = [...memoryChunks, ...knowledgeChunks];
  const knowledgeBlock = buildContextBlock(knowledgeChunks);
  const memoryBlock = buildContextBlock(memoryChunks);

  // 2. Build system prompt
  const systemKey = input.language === "ne" ? "SYSTEM_TUTOR_NEPALI" : "SYSTEM_TUTOR_ENGLISH";
  const weakTopics = input.user_skill_summary?.filter((s) => s.score < 50).map((s) => s.topic).join(", ") ?? "none";
  const strongTopics = input.user_skill_summary?.filter((s) => s.score >= 70).map((s) => s.topic).join(", ") ?? "none";

  const systemPrompt = renderPrompt(getPrompt(systemKey, input.language), {
    current_date: new Date().toLocaleDateString(input.language === "ne" ? "ne-NP" : "en-US"),
    user_name: input.user_profile?.user_id?.slice(0, 8) ?? "Student",
    target_exam: input.user_profile?.user_id ?? "Not set",
    weak_topics: weakTopics,
    strong_topics: strongTopics,
  });

  // 3. Build messages
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // Add recent conversation history (last 6 turns)
  if (input.recent_messages) {
    messages.push(...input.recent_messages.slice(-6));
  }

  // Add context block as a "system" turn
  if (knowledgeBlock || memoryBlock) {
    let contextMsg = "";
    if (memoryBlock) {
      contextMsg += `[USER MEMORY CONTEXT]\n${memoryBlock}\n\n`;
    }
    if (knowledgeBlock) {
      contextMsg += `[VERIFIED KNOWLEDGE]\n${knowledgeBlock}\n\n`;
    }
    contextMsg += `\n[INSTRUCTION] Use the verified knowledge above to ground your answer. Cite sources with [Source N] where relevant. If the verified knowledge doesn't cover the question, say so.`;

    messages.push({ role: "system", content: contextMsg });
  }

  // Add user query
  messages.push({ role: "user", content: input.query });

  const duration = Date.now() - startTime;
  logger.debug(
    { user_id: input.user_id, knowledge_count: knowledgeChunks.length, memory_count: memoryChunks.length, duration_ms: duration },
    "Context built"
  );

  // Estimate tokens (rough: 1 token per 4 chars)
  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  const total_tokens_estimate = Math.ceil(totalChars / 4);

  return {
    system_prompt: systemPrompt,
    messages,
    retrieved_chunks: allChunks,
    citations: buildCitations(knowledgeChunks),
    total_tokens_estimate,
  };
}

// Safety: detect off-topic or unsafe queries
const OFF_TOPIC_PATTERNS = [
  /medical advice|diagnose|symptoms|treatment/i,
  /legal advice|lawsuit|attorney/i,
  /stock (tip|recommendation)|crypto (tip|advice)/i,
  /dating|relationship advice/i,
];

const UNSAFE_PATTERNS = [
  /how to (cheat|hack|kill|harm)/i,
  /porn|sex|nude/i,
  /racist|slur/i,
];

export function checkSafety(query: string): { safe: true } | { safe: false; reason: string } {
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(query)) {
      return { safe: false, reason: "unsafe_content" };
    }
  }
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(query)) {
      return { safe: false, reason: "off_topic" };
    }
  }
  return { safe: true };
}
