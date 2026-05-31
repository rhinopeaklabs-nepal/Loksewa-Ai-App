export interface KnowledgeBaseDocument {
  id: string;
  title: string;
  body: string;
  sourceName?: string;
}

export interface KnowledgeBase {
  findById(id: string): Promise<KnowledgeBaseDocument | null>;
  search(query: string): Promise<KnowledgeBaseDocument[]>;
}
