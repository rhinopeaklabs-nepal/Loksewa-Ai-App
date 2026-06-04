// AI Service — Tutor controller
import { randomUUID } from "node:crypto";
import { query, getConfig, logger, publishEvent, AISafetyError } from "@loksewa/shared-utils";
import { chatCompletion, streamChatCompletion } from "../llm/client.js";
import { buildContext, checkSafety } from "../rag/contextBuilder.js";
import { getPrompt, renderPrompt } from "../prompts/templates.js";
import type {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  Citation,
  UserProfile,
  Memory,
} from "@loksewa/shared-types";

export interface TutorTurnResult {
  conversation_id: string;
  turn_id: string;
  response: string;
  citations: Citation[];
  source: "verified_db" | "ai_rag" | "ai_only" | "cache" | "refused";
  model: string;
  tokens_used: number;
  latency_ms: number;
}

export async function handleChatTurn(
  userId: string,
  request: ChatRequest
): Promise<TutorTurnResult> {
  // 1. Safety check
  const safety = checkSafety(request.message);
  if (!safety.safe) {
    return handleRefusal(userId, request, safety.reason);
  }

  // 2. Get/create conversation
  const conversationId = request.conversation_id ?? (await createConversation(userId, request));

  // 3. Get user context (profile + memories)
  const [profile, memories, recentMessages] = await Promise.all([
    getUserProfile(userId),
    getRecentMemories(userId, 5),
    getRecentMessages(conversationId, 6),
  ]);

  // 4. Build context with RAG
  const ctx = await buildContext({
    user_id: userId,
    user_profile: profile ?? undefined,
    user_memories: memories,
    user_skill_summary: await getSkillSummary(userId),
    query: request.message,
    language: request.language === "ne" ? "ne" : "en",
    mode: request.context?.mode === "mistake_review" ? "explain_answer" : request.context?.mode,
    recent_messages: recentMessages,
  });

  // 5. Determine source
  const hasRAG = ctx.retrieved_chunks.length > 0 && ctx.retrieved_chunks[0]!.score > 0.65;
  const source: TutorTurnResult["source"] = hasRAG ? "ai_rag" : "ai_only";

  // 6. Call LLM
  const startTime = Date.now();
  const completion = await chatCompletion(ctx.messages, {
    temperature: 0.7,
    max_tokens: 1024,
  });
  const latency = Date.now() - startTime;

  // 7. Post-process: add disclaimer if factual
  let finalResponse = completion.content;
  if (isFactualContent(finalResponse) && !finalResponse.includes("कृपया") && !finalResponse.includes("verify")) {
    finalResponse +=
      request.language === "ne"
        ? "\n\n_कृपया राजपत्र वा आधिकारिक स्रोतसँग जाँच गर्नुहोस्।_"
        : "\n\n_Please verify with Rajpatra or official sources._";
  }

  // 8. Persist
  const turnId = randomUUID();
  await saveMessages(conversationId, userId, request.message, finalResponse, ctx.citations, source, {
    model: completion.model,
    prompt_tokens: completion.prompt_tokens,
    completion_tokens: completion.completion_tokens,
    total_tokens: completion.total_tokens,
    latency_ms: latency,
    retrieval_count: ctx.retrieved_chunks.length,
  });

  await updateConversationStats(conversationId, completion.total_tokens, latency);

  // 9. Publish event
  await publishEvent("ai.conversation.created", {
    event_id: randomUUID(),
    event_type: "ai.conversation.created",
    event_version: 1,
    occurred_at: new Date().toISOString(),
    producer: "ai-service",
    user_id: userId,
    session_id: conversationId,
    payload: {
      conversation_id: conversationId,
      turn_id: turnId,
      model_used: completion.model,
      tokens_used: completion.total_tokens,
      latency_ms: latency,
      source,
    },
  });

  return {
    conversation_id: conversationId,
    turn_id: turnId,
    response: finalResponse,
    citations: ctx.citations,
    source,
    model: completion.model,
    tokens_used: completion.total_tokens,
    latency_ms: latency,
  };
}

async function handleRefusal(
  userId: string,
  request: ChatRequest,
  reason: string
): Promise<TutorTurnResult> {
  const language = request.language ?? "en";
  const message = reason === "unsafe_content" ? getPrompt("REFUSAL_UNSAFE", language) : getPrompt("REFUSAL_OFF_TOPIC", language);

  const conversationId = request.conversation_id ?? (await createConversation(userId, request));
  const turnId = randomUUID();

  await saveMessages(conversationId, userId, request.message, message, [], "refused", {
    model: "refused",
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    latency_ms: 0,
    retrieval_count: 0,
  });

  return {
    conversation_id: conversationId,
    turn_id: turnId,
    response: message,
    citations: [],
    source: "refused",
    model: "refused",
    tokens_used: 0,
    latency_ms: 0,
  };
}

function isFactualContent(text: string): boolean {
  // Heuristic: contains dates, numbers, or proper nouns
  return /\b(19|20)\d{2}\b/.test(text) || /\%/.test(text) || /\b\d+\b/.test(text);
}

// ============ Persistence helpers ============
async function createConversation(userId: string, request: ChatRequest): Promise<string> {
  const result = await query<{ id: string }>(
    `INSERT INTO ai_conversations (user_id, session_id, mode, topic)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, randomUUID(), request.context?.mode ?? "free_chat", request.context?.topic ?? null]
  );
  return result.rows[0]!.id;
}

async function saveMessages(
  conversationId: string,
  userId: string,
  userMessage: string,
  assistantMessage: string,
  citations: Citation[],
  source: string,
  metrics: {
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    latency_ms: number;
    retrieval_count: number;
  }
): Promise<void> {
  const turnResult = await query<{ turn_index: number }>(
    `SELECT COALESCE(MAX(turn_index), 0) + 1 as turn_index FROM ai_messages WHERE conversation_id = $1`,
    [conversationId]
  );
  const turnIndex = turnResult.rows[0]?.turn_index ?? 1;

  await query("BEGIN");
  try {
    await query(
      `INSERT INTO ai_messages (conversation_id, user_id, turn_index, role, content, source, model_used, prompt_tokens, completion_tokens, total_tokens, latency_ms, retrieval_count, citations)
       VALUES ($1, $2, $3, 'user', $4, 'verified_db', NULL, 0, 0, 0, 0, 0, '[]'::jsonb)`,
      [conversationId, userId, turnIndex, userMessage]
    );
    await query(
      `INSERT INTO ai_messages (conversation_id, user_id, turn_index, role, content, source, model_used, prompt_tokens, completion_tokens, total_tokens, latency_ms, retrieval_count, citations)
       VALUES ($1, $2, $3, 'assistant', $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        conversationId,
        userId,
        turnIndex,
        assistantMessage,
        source,
        metrics.model,
        metrics.prompt_tokens,
        metrics.completion_tokens,
        metrics.total_tokens,
        metrics.latency_ms,
        metrics.retrieval_count,
        JSON.stringify(citations),
      ]
    );
    await query("COMMIT");
  } catch (e) {
    await query("ROLLBACK");
    throw e;
  }
}

async function updateConversationStats(conversationId: string, tokens: number, latencyMs: number): Promise<void> {
  await query(
    `UPDATE ai_conversations
     SET total_turns = total_turns + 1,
         total_tokens = total_tokens + $2,
         last_active_at = NOW()
     WHERE id = $1`,
    [conversationId, tokens]
  );
  await query(
    `INSERT INTO ai_usage_log (user_id, service, operation, model, total_tokens, latency_ms, cost_usd)
     SELECT user_id, 'ai-service', 'chat', model_used, total_tokens, latency_ms,
            (total_tokens::numeric / 1000) * 0.001   -- placeholder cost
     FROM ai_messages
     WHERE conversation_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [conversationId]
  );
}

async function getRecentMessages(conversationId: string, limit: number): Promise<ChatMessage[]> {
  const result = await query<{ role: string; content: string }>(
    `SELECT role, content FROM ai_messages WHERE conversation_id = $1
     ORDER BY turn_index DESC LIMIT $2`,
    [conversationId, limit]
  );
  return result.rows.reverse().map((r) => ({ role: r.role as any, content: r.content }));
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Call user service via HTTP or fall back to direct DB
  try {
    const result = await query<UserProfile>(
      `SELECT * FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

async function getRecentMemories(userId: string, limit: number): Promise<Memory[]> {
  const result = await query<Memory>(
    `SELECT * FROM user_memories
     WHERE user_id = $1 AND is_active = true
     ORDER BY importance DESC, created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

async function getSkillSummary(userId: string): Promise<{ topic: string; score: number }[]> {
  const result = await query<{ topic: string; skill_score: number }>(
    `SELECT topic, AVG(skill_score) as skill_score FROM user_progress
     WHERE user_id = $1 GROUP BY topic`,
    [userId]
  );
  return result.rows.map((r) => ({ topic: r.topic, score: Number(r.skill_score) }));
}
