import { BaseService } from "../../../core/base/BaseService";
import type { TutorContext } from "../entities/TutorContext";
import { DocumentRetriever } from "../rag/DocumentRetriever";

export class RAGPipeline extends BaseService {
  constructor(private readonly documentRetriever = new DocumentRetriever()) {
    super("RAGPipeline");
  }

  async buildContext(userId: string, question: string): Promise<TutorContext> {
    const documents = await this.documentRetriever.retrieve(question);
    return {
      userId,
      question,
      retrievedDocuments: documents.map((document) => document.text),
      sourceIds: documents.map((document) => document.id)
    };
  }
}
