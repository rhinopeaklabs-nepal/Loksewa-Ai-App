import type { QuestionDTO } from "../dto/QuestionDTO";

export class QuestionMapper {
  static toDTO(value: QuestionDTO): QuestionDTO {
    return value;
  }
}
