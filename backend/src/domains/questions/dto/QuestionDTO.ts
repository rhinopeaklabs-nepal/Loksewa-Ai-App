export interface QuestionDTO {
  id: string;
  questionText: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
}
