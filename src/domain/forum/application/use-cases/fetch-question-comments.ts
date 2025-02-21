import { Either, right } from "@/core/either";
import { QuestionCommentsRepository } from "../repositories/question-comments-repository";
import { Injectable } from "@nestjs/common";
import { CommentWithAuthor } from "../../enterprise/entities/value-objects/comment-with-author";

interface FetchQuestionCommentsRequest {
    questionId: string;
    page: number;
}

type FetchQuestionCommentsResponse = Either<
    null,
    {
        comments: CommentWithAuthor[];
    }
>

@Injectable()
export class FetchQuestionCommentsUseCase {
    constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

    async execute({ questionId, page }: FetchQuestionCommentsRequest): Promise<FetchQuestionCommentsResponse> {
        const comments = await this.questionCommentsRepository.findManyByQuestionIdWithAuthor(questionId, { page });

        return right({
            comments
        });
    }
}
