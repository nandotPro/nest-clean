import { Either, left, right } from "@/core/either";
import { QuestionsRepository } from "../repositories/questions-repository";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";

interface DeleteQuestionRequest {
    questionId: string;
    authorId: string;
}

type DeleteQuestionResponse = Either<
    ResourceNotFoundError | NotAllowedError,
    {}
>

export class DeleteQuestionUseCase {
    constructor(private questionsRepository: QuestionsRepository) {}

    async execute({ questionId, authorId }: DeleteQuestionRequest): Promise<DeleteQuestionResponse> {
        const question = await this.questionsRepository.findById(questionId);

        if (!question) {
            return left(new ResourceNotFoundError());
        }

        if (authorId !== question.authorId.toString()) { 
            return left(new NotAllowedError());
        }

        await this.questionsRepository.delete(question);

        return right({});
    }
}