import { BaseService } from "../../../core/base/BaseService";

export class TextPreprocessorService extends BaseService {
  constructor() {
    super("TextPreprocessorService");
  }

  normalize(text: string): string {
    return text.replace(/\s+/g, " ").trim();
  }
}
