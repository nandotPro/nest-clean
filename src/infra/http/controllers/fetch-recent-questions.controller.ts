import { Controller, Get, Query, BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { FetchRecentQuestionsUseCase } from "@/domain/forum/application/use-cases/fetch-recent-questions";
import { QuestionPresenter } from "../presenters/question-presenter";

const pageQueryParamSchema = z.object({
    page: z.string().optional().default('1').transform(Number),
    size: z.string().optional().default('20').transform(Number),
});

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller('/questions')
export class FetchRecentQuestionsController {
    constructor(private fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

    @Get()
    async handle(@Query(queryValidationPipe) query: PageQueryParamSchema) {
        const questions = await this.fetchRecentQuestions.execute({
            page: query.page,
        });

        if (questions.isLeft()) {
            throw new BadRequestException('Unexpected error');
        }

        return { 
            questions: questions.value?.questions.map(QuestionPresenter.toHTTP),
        };
    }
}