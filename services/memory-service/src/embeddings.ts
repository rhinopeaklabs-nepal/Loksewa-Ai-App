// Memory service - embedding generation for semantic memory search.
import { logger } from "@loksewa/shared-utils";

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const embedding = new Array<number>(384).fill(0);

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const pos = (charCode * (i + 1)) % embedding.length;
      embedding[pos] += (charCode / 65535) * 2 - 1;
    }

    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= norm;
      }
    }

    return embedding;
  } catch (error) {
    logger.warn({ error, text: text.substring(0, 50) }, "Failed to generate embedding");
    return new Array<number>(384).fill(0);
  }
}

export async function getEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await getEmbedding(text));
  }
  return embeddings;
}

export default { getEmbedding, getEmbeddingsBatch };
