import { Either, left, right } from "@/core/either";
import { Question } from "../../enterprise/entities/question";
import { AnswersRepository } from "../repositories/answers-repository";
import { QuestionsRepository } from "../repositories/questions-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";

interface ChooseQuestionBestAnswerRequest {
    authorId: string;
    answerId: string;
}

type ChooseQuestionBestAnswerResponse = Either<
    ResourceNotFoundError | NotAllowedError,
    {
        question: Question;
    }
>

export class ChooseQuestionBestAnswerUseCase {
    constructor(private answersRepository: AnswersRepository, private questionsRepository: QuestionsRepository) {}

    async execute({ authorId, answerId }: ChooseQuestionBestAnswerRequest): Promise<ChooseQuestionBestAnswerResponse> {
        const answer = await this.answersRepository.findById(answerId);

        if (!answer) {
            return left(new ResourceNotFoundError());
        }

        const question = await this.questionsRepository.findById(answer.questionId.toValue());

        if (!question) {
            return left(new ResourceNotFoundError());
        }

        if (authorId !== question.authorId.toString()) {
            return left(new NotAllowedError());
        }

        question.bestAnswerId = answer.id;

        await this.questionsRepository.save(question);

        return right({ question });
    }
}