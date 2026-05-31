export interface VectorSearchResult {
  id: string;
  score: number;
  text: string;
}

export class VectorSearch {
  private readonly documents: VectorSearchResult[] = [
    {
      id: "constitution-fundamental-rights",
      score: 1,
      text: "The Constitution of Nepal guarantees 31 fundamental rights in Part 3."
    },
    {
      id: "geography-everest",
      score: 1,
      text: "Mount Everest's official height is 8848.86 meters."
    }
  ];

  async search(query: string, limit = 5): Promise<VectorSearchResult[]> {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.documents
      .map((document) => {
        const haystack = document.text.toLowerCase();
        const hits = terms.filter((term) => haystack.includes(term)).length;
        return { ...document, score: hits / Math.max(terms.length, 1) };
      })
      .filter((document) => document.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
