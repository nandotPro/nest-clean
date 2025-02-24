import { Either, left, right } from "@/core/either";
import { QuestionsRepository } from "../repositories/questions-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { Injectable } from "@nestjs/common";
import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question.details";
interface GetQuestionBySlugRequest {
    slug: string;
}

type GetQuestionBySlugResponse = Either<
    ResourceNotFoundError,
    {
        question: QuestionDetails;
    }
>

@Injectable()
export class GetQuestionBySlugUseCase {
    constructor(private questionsRepository: QuestionsRepository) {}    

    async execute({ slug }: GetQuestionBySlugRequest): Promise<GetQuestionBySlugResponse> {
        const question = await this.questionsRepository.findDetailsBySlug(slug);

        if (!question) {
            return left(new ResourceNotFoundError());
        }

        return right({
            question,
        });
    }
}