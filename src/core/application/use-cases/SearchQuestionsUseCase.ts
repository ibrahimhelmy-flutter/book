import { IQuestionRepository, QuestionFilterCriteria } from "../../domain/interfaces/IQuestionRepository";
import { Question } from "../../domain/entities/Question";

export class SearchQuestionsUseCase {
  constructor(private questionRepository: IQuestionRepository) {}

  public async execute(criteria: QuestionFilterCriteria): Promise<Question[]> {
    return this.questionRepository.search(criteria);
  }
}
