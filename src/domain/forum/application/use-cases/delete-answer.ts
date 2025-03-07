import { Either, left, right } from "@/core/either";
import { AnswersRepository } from "../repositories/answers-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { Injectable } from "@nestjs/common";

interface DeleteAnswerRequest {
    answerId: string;
    authorId: string;
}

type DeleteAnswerResponse = Either<
    ResourceNotFoundError | NotAllowedError,
    {}
>

@Injectable()
export class DeleteAnswerUseCase {
    constructor(private answersRepository: AnswersRepository) {}

    async execute({ answerId, authorId }: DeleteAnswerRequest): Promise<DeleteAnswerResponse> {
        const answer = await this.answersRepository.findById(answerId);

        if (!answer) {
            return left(new ResourceNotFoundError());
        }

        if (authorId !== answer.authorId.toString()) {
            return left(new NotAllowedError());
        }

        await this.answersRepository.delete(answer);

        return right({});
    }
}