import { Either, right } from "@/core/either";
import { Question } from "../../enterprise/entities/question";
import { QuestionsRepository } from "../repositories/questions-repository";
import { Injectable } from "@nestjs/common";

interface FetchRecentQuestionsRequest {
    page: number;
}

type FetchRecentQuestionsResponse = Either<
    null,
    {
        questions: Question[];
    }
>

@Injectable()
export class FetchRecentQuestionsUseCase {
    constructor(private questionsRepository: QuestionsRepository) {}

    async execute({ page }: FetchRecentQuestionsRequest): Promise<FetchRecentQuestionsResponse> {
        const questions = await this.questionsRepository.findManyRecent({ page });

        return right({
            questions
        });
    }
}