import { Either, right } from "@/core/either";
import { AnswerComment } from "../../enterprise/entities/answer-comment";
import { AnswerCommentsRepository } from "../repositories/answer-comments-repository";
import { Injectable } from "@nestjs/common";

interface FetchAnswerCommentsRequest {
    answerId: string;
    page: number;
}

type FetchAnswerCommentsResponse = Either<
    null,
    {
        comments: AnswerComment[];
    }
>

@Injectable()
export class FetchAnswerCommentsUseCase {
    constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

    async execute({ answerId, page }: FetchAnswerCommentsRequest): Promise<FetchAnswerCommentsResponse> {
        const comments = await this.answerCommentsRepository.findManyByAnswerId(answerId, { page });

        return right({
            comments
        });
    }
}
