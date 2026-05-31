import { BaseService } from "../../../core/base/BaseService";

export interface ScoreInput {
  correct: number;
  wrong: number;
  marksPerQuestion?: number;
  negativeMarking?: number;
}

export class ScoringService extends BaseService {
  constructor() {
    super("ScoringService");
  }

  calculate(input: ScoreInput): number {
    const marks = input.marksPerQuestion ?? 1;
    const penalty = input.negativeMarking ?? 0;
    return input.correct * marks - input.wrong * penalty;
  }
}
