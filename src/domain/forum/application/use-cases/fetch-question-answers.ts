import { Either, right } from "@/core/either";
import { Answer } from "../../enterprise/entities/answer";
import { AnswersRepository } from "../repositories/answers-repository";
import { Injectable } from "@nestjs/common";

interface FetchQuestionAnswersRequest {
    page: number;
    questionId: string;
}

type FetchQuestionAnswersResponse = Either<
    null,
    {
        answers: Answer[];
    }
>

@Injectable()
export class FetchQuestionAnswersUseCase {
    constructor(private answersRepository: AnswersRepository) {}

    async execute({ page, questionId }: FetchQuestionAnswersRequest): Promise<FetchQuestionAnswersResponse> {
        const answers = await this.answersRepository.findManyByQuestionId(questionId, { page });

        return right({
            answers
        });
    }
}