import { Either, right } from "@/core/either";
import { AnswerComment } from "../../enterprise/entities/answer-comment";
import { AnswerCommentsRepository } from "../repositories/answer-comments-repository";
import { Injectable } from "@nestjs/common";
import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";

interface FetchAnswerCommentsRequest {
    answerId: string;
    page: number;
}

type FetchAnswerCommentsResponse = Either<
    null,
    {
        comments: CommentWithAuthor[];
    }
>

@Injectable()
export class FetchAnswerCommentsUseCase {
    constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

    async execute({ answerId, page }: FetchAnswerCommentsRequest): Promise<FetchAnswerCommentsResponse> {
        const comments = await this.answerCommentsRepository.findManyByAnswerIdWithAuthor(answerId, { page });

        return right({
            comments,
        });
    }
}
