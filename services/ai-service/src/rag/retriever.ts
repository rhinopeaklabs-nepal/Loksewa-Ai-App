// AI Service — RAG (Retrieval-Augmented Generation) with enhanced contextual retrieval
import { QdrantClient } from "@qdrant/js-client-rest";
import { getConfig, logger } from "@loksewa/shared-utils";
import { getEmbedding } from "../llm/client.js";
import type { Citation, Memory } from "@loksewa/shared-types";

let qdrant: QdrantClient | null = null;
type KnowledgeSourceType = Citation["source_type"] | "memory";

function getQdrant(): QdrantClient {
  if (qdrant) return qdrant;
  const config = getConfig();
  qdrant = new QdrantClient({
    url: config.QDRANT_URL,
    apiKey: config.QDRANT_API_KEY,
  });
  return qdrant;
}

export const COLLECTIONS = {
  KNOWLEDGE: "knowledge_chunks",
  QUESTIONS: "verified_questions",
  CURRENT_AFFAIRS: "current_affairs",
  USER_MEMORIES: (userId: string) => `user_${userId}_memories`,
  AI_CONVERSATIONS: "ai_conversations",
};

export interface KnowledgeChunk {
  id: string;
  text: string;
  source_id: string;
  source_type: KnowledgeSourceType;
  topic: string;
  subtopic?: string;
  year?: number;
  language: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export async function ensureCollections(): Promise<void> {
  const config = getConfig();
  const collections = [COLLECTIONS.KNOWLEDGE, COLLECTIONS.QUESTIONS, COLLECTIONS.CURRENT_AFFAIRS, COLLECTIONS.AI_CONVERSATIONS];

  for (const name of collections) {
    try {
      await getQdrant().getCollection(name);
    } catch {
      logger.info({ collection: name }, "Creating Qdrant collection");
      await getQdrant().createCollection(name, {
        vectors: { size: config.EMBEDDING_DIM, distance: "Cosine" },
        optimizers_config: { default_segment_number: 2 },
        replication_factor: 1,
      });
    }
  }
}

// Enhanced retrieval with hybrid search and re-ranking
export async function retrieveKnowledge(
  query: string,
  options: { 
    limit?: number; 
    scoreThreshold?: number; 
    filter?: Record<string, unknown>;
    includeMemories?: boolean;
    userId?: string;
    boostRecent?: boolean;
  } = {}
): Promise<KnowledgeChunk[]> {
  const limit = options.limit ?? 5;
  const scoreThreshold = options.scoreThreshold ?? 0.55; // Lowered for better recall
  const includeMemories = options.includeMemories ?? true;
  const userId = options.userId;
  const boostRecent = options.boostRecent ?? true;

  const queryVector = await getEmbedding(query);

  // Retrieve from knowledge base
  let knowledgeResults = await getQdrant().search(COLLECTIONS.KNOWLEDGE, {
    vector: queryVector,
    limit: limit * 2, // Get more for re-ranking
    score_threshold: scoreThreshold,
    with_payload: true,
  });

  // Retrieve user memories if requested
  let memoryResults: any[] = [];
  if (includeMemories && userId) {
    try {
      const memoryCollection = COLLECTIONS.USER_MEMORIES(userId);
      memoryResults = await getQdrant().search(memoryCollection, {
        vector: queryVector,
        limit: Math.ceil(limit / 2),
        score_threshold: 0.6,
        with_payload: true,
      });
    } catch {
      // Memory collection might not exist yet
      memoryResults = [];
    }
  }

  // Combine and re-rank results
  const allResults = [...knowledgeResults, ...memoryResults];
  
  // Apply re-ranking based on boost factors
  const rankedResults = allResults.map((r) => {
    let finalScore = r.score;
    
    // Boost recent memories
    if (boostRecent && r.payload?.created_at) {
      const daysOld = (Date.now() - new Date(r.payload.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.max(0, 1 - (daysOld / 30)); // Linear decay over 30 days
      finalScore += recencyBoost * 0.1; // Up to 0.1 boost
    }
    
    // Boost verified sources
    if (r.payload?.verified) {
      finalScore += 0.05;
    }
    
    return { ...r, score: Math.min(1.0, finalScore) };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);

  return rankedResults.map((r) => ({
    id: r.id as string,
    text: (r.payload as any).chunk_text ?? (r.payload as any).fact ?? (r.payload as any).text ?? "",
    source_id: (r.payload as any).source_id ?? (r.payload as any).memory_id ?? (r.payload as any).question_id ?? "",
    source_type: 
      (r.payload as any).memory_id ? "memory" :
      (r.payload as any).question_id ? "question" :
      "document" as const,
    topic: (r.payload as any).topic ?? "",
    subtopic: (r.payload as any).subtopic,
    year: (r.payload as any).year,
    language: (r.payload as any).language ?? "en",
    score: r.score,
    metadata: {
      verified: (r.payload as any).verified ?? false,
      created_at: (r.payload as any).created_at ?? null,
      importance: (r.payload as any).importance ?? null
    }
  }));
}

export async function retrieveSimilarQuestions(
  query: string,
  options: { limit?: number; topic?: string; difficulty?: number } = {}
): Promise<KnowledgeChunk[]> {
  const limit = options.limit ?? 3;
  const queryVector = await getEmbedding(query);

  const filterConditions: any[] = [];
  if (options.topic) {
    filterConditions.push({ key: "topic", match: { value: options.topic } });
  }
  if (options.difficulty !== undefined) {
    filterConditions.push({ key: "difficulty", range: { gte: options.difficulty - 1, lte: options.difficulty + 1 } });
  }

  const filter = filterConditions.length > 0 ? { must: filterConditions } : undefined;

  const results = await getQdrant().search(COLLECTIONS.QUESTIONS, {
    vector: queryVector,
    limit,
    score_threshold: 0.65,
    filter,
    with_payload: true,
  });

  return results.map((r) => ({
    id: r.id as string,
    text: (r.payload as any).text ?? "",
    source_id: (r.payload as any).question_id ?? "",
    source_type: "question" as const,
    topic: (r.payload as any).topic ?? "",
    subtopic: (r.payload as any).subtopic,
    language: (r.payload as any).language ?? "en",
    score: r.score,
    metadata: {
      difficulty: (r.payload as any).difficulty ?? null,
      verified: (r.payload as any).verified ?? false
    }
  }));
}

export async function retrieveUserMemories(
  userId: string,
  query: string,
  limit: number = 5,
  options: { memoryTypes?: string[]; minImportance?: number } = {}
): Promise<KnowledgeChunk[]> {
  const collection = COLLECTIONS.USER_MEMORIES(userId);
  try {
    const queryVector = await getEmbedding(query);
    
    let filter: any = undefined;
    if (options.memoryTypes?.length) {
      filter = { must: [{ key: "memory_type", match: { any: options.memoryTypes } }] };
    }
    if (options.minImportance !== undefined) {
      if (!filter) filter = { must: [] };
      filter.must.push({ key: "importance", range: { gte: options.minImportance } });
    }

    const results = await getQdrant().search(collection, {
      vector: queryVector,
      limit,
      score_threshold: 0.6,
      filter,
      with_payload: true,
    });
    
    return results.map((r) => ({
      id: r.id as string,
      text: (r.payload as any).fact ?? "",
      source_id: (r.payload as any).memory_id ?? "",
      source_type: "memory" as const,
      topic: (r.payload as any).category ?? "memory",
      subtopic: (r.payload as any).subtopic,
      language: (r.payload as any).language ?? "en",
      score: r.score,
      metadata: {
        importance: (r.payload as any).importance ?? null,
        confidence: (r.payload as any).confidence ?? null,
        created_at: (r.payload as any).created_at ?? null
      }
    }));
  } catch {
    // Collection might not exist yet
    return [];
  }
}

export function buildCitations(chunks: KnowledgeChunk[]): Citation[] {
  return chunks.slice(0, 3).map((c) => ({
    source_id: c.source_id,
    source_type: c.source_type === "memory" ? "document" : c.source_type,
    title: c.topic + (c.subtopic ? ` / ${c.subtopic}` : ""),
    snippet: c.text.slice(0, 200),
    score: c.score
  }));
}

export function buildContextBlock(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map(
      (c, i) => {
        const sourceIcon = c.source_type === "memory" ? "🧠" : 
                          c.source_type === "question" ? "❓" : "📚";
        return `[${sourceIcon} Source ${i + 1}] (${c.topic}${c.subtopic ? ` / ${c.subtopic}` : ""}, score: ${c.score.toFixed(2)})\n${c.text}`;
      }
    )
    .join("\n\n---\n\n");
}

// New function for contextual query expansion
export async function expandQueryWithContext(
  query: string,
  userId: string,
  context: { recentTopics?: string[]; currentMission?: string } = {}
): Promise<string> {
  // Get user's recent weak topics for query expansion
  const weakTopics = await retrieveUserMemories(userId, "struggle weak difficulty", 3, {
    memoryTypes: ["learning"],
    minImportance: 4
  });
  
  const weakTopicTexts = weakTopics
    .map(t => t.text)
    .filter(text => text.length > 0)
    .slice(0, 2);
  
  // Build expanded query
  const expansions = [...weakTopicTexts];
  if (context.recentTopics?.length) {
    expansions.push(...context.recentTopics.slice(0, 2));
  }
  
  if (expansions.length > 0) {
    return `${query} Context: ${expansions.join(" ")}`;
  }
  
  return query;
}
