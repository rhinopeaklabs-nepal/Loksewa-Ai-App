import { BaseService } from "../../../core/base/BaseService";
import type { TutorContext } from "../entities/TutorContext";

export class ContextBuilder extends BaseService {
  constructor() {
    super("ContextBuilder");
  }

  fromDocuments(userId: string, retrievedDocuments: string[]): TutorContext {
    return { userId, retrievedDocuments, sourceIds: [] };
  }
}
