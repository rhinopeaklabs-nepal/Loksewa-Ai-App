export interface AnswerDTO {
  questionId: string;
  correctOption: string;
  explanation?: string;
  sourceName?: string;
  verified: boolean;
}
