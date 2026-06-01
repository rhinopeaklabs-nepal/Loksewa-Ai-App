// Memory service — Embedding generation for semantic memory search
// In production, this would connect to an actual embedding service (like BGE-m3)
// For now, we'll use a simplified hash-based approach for demonstration

import { logger } from "@loksewa/shared-utils";

/**
 * Generate embedding for text
 * In production: Use actual embedding model (BGE-m3, etc.)
 * For demo: Simple hash-based vector (not for production use)
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    // For production, replace with actual embedding service call
    // Example: const response = await axios.post(EMBEDDING_SERVICE_URL, { text });
    // return response.data.embedding;
    
    // Simplified deterministic embedding for demonstration
    // This is NOT suitable for production - replace with real embedding model
    const embedding = new Array(384).fill(0); // 384-dim embedding (common size)
    
    // Simple hash-based distribution (for demo only)
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const pos = (charCode * (i + 1)) % embedding.length;
      embedding[pos] += (charCode / 65535) * 2 - 1; // Normalize to [-1, 1]
    }
    
    // Normalize vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= norm;
      }
    }
    
    return embedding;
  } catch (error) {
    logger.warn({ error, text: text.substring(0, 50) }, "Failed to generate embedding");
    // Return zero vector as fallback
    return new Array(384).fill(0);
  }
}

/**
 * Generate embeddings for batch of texts
 */
export async function getEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await getEmbedding(text));
  }
  return embeddings;
}

// Export for use in other modules
export default { getEmbedding, getEmbeddingsBatch };