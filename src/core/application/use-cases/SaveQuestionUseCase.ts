import { IQuestionRepository } from "../../domain/interfaces/IQuestionRepository";
import { Question } from "../../domain/entities/Question";
import { ValidateQuestionUseCase } from "./ValidateQuestionUseCase";

export class SaveQuestionUseCase {
  constructor(
    private questionRepository: IQuestionRepository,
    private validator: ValidateQuestionUseCase
  ) {}

  public async execute(question: Question): Promise<{ success: boolean; issues?: string[] }> {
    const existing = await this.questionRepository.findByBook(question.bookId);
    const validation = this.validator.execute(question, existing);

    if (!validation.isValid) {
      return {
        success: false,
        issues: validation.issues,
      };
    }

    question.status = "approved";
    question.updatedAt = new Date();
    await this.questionRepository.save(question);

    return { success: true };
  }
}
