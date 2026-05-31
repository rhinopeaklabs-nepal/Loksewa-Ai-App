import type { VectorSearchResult } from "./VectorSearch";
import { VectorSearch } from "./VectorSearch";

export class DocumentRetriever {
  constructor(private readonly vectorSearch = new VectorSearch()) {}

  async retrieve(query: string): Promise<VectorSearchResult[]> {
    return this.vectorSearch.search(query, 5);
  }
}
