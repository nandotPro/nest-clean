import { Either, left, right } from "@/core/either";
import { AnswerCommentsRepository } from "../repositories/answer-comments-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { Injectable } from "@nestjs/common";

interface DeleteAnswerCommentRequest {
    answerCommentId: string;
    authorId: string;
}

type DeleteAnswerCommentResponse = Either<
    ResourceNotFoundError | NotAllowedError,
    {}
>

@Injectable()
export class DeleteAnswerCommentUseCase {
    constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

    async execute({ answerCommentId, authorId }: DeleteAnswerCommentRequest): Promise<DeleteAnswerCommentResponse> {
        const comment = await this.answerCommentsRepository.findById(answerCommentId);

        if (!comment) {
            return left(new ResourceNotFoundError());
        }

        if (authorId !== comment.authorId.toString()) {
            return left(new NotAllowedError());
        }

        await this.answerCommentsRepository.delete(comment);

        return right({});
    }
}
