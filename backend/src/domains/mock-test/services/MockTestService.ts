import { BaseService } from "../../../core/base/BaseService";
import type { MockTest } from "../entities/MockTest";

export class MockTestService extends BaseService {
  constructor() {
    super("MockTestService");
  }

  listActive(tests: MockTest[]): MockTest[] {
    return tests.filter((test) => test.published);
  }

  totalMarks(test: MockTest, marksPerQuestion = 1): number {
    return test.totalQuestions * marksPerQuestion;
  }
}
