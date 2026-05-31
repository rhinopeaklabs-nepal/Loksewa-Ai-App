import { BaseService } from "../../../core/base/BaseService";

export class AnswerVerificationService extends BaseService {
  constructor() {
    super("AnswerVerificationService");
  }

  canPublish(status: string): boolean {
    return status === "verified";
  }
}
