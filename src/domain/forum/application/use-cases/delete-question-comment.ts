import { Either, left, right } from "@/core/either";
import { QuestionCommentsRepository } from "../repositories/question-comments-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";

interface DeleteQuestionCommentRequest {
    questionCommentId: string;
    authorId: string;
}

type DeleteQuestionCommentResponse = Either<
    ResourceNotFoundError | NotAllowedError,
    {}
>

export class DeleteQuestionCommentUseCase {
    constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

    async execute({ questionCommentId, authorId }: DeleteQuestionCommentRequest): Promise<DeleteQuestionCommentResponse> {
        const comment = await this.questionCommentsRepository.findById(questionCommentId);

        if (!comment) {
            return left(new ResourceNotFoundError());
        }

        if (authorId !== comment.authorId.toString()) {
            return left(new NotAllowedError());
        }

        await this.questionCommentsRepository.delete(comment);

        return right({});
    }
}
