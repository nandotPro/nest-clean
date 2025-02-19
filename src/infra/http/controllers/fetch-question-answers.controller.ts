import { BadRequestException, Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { FetchQuestionAnswersUseCase } from "@/domain/forum/application/use-cases/fetch-question-answers";
import { AnswerPresenter } from "../presenters/answer-presenter";

const pageQueryParamSchema = z.object({
    page: z.string().optional().default('1').transform(Number),
});

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller('/questions/:questionId/answers')
@UseGuards(JwtAuthGuard)
export class FetchQuestionAnswersController {
    constructor(private fetchQuestionAnswers: FetchQuestionAnswersUseCase) {}

    @Get()
    async handle(
        @Query(queryValidationPipe) query: PageQueryParamSchema,
        @Param('questionId') questionId: string,
    ) {
        const result = await this.fetchQuestionAnswers.execute({
            page: query.page,
            questionId,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        const answers = result.value.answers;

        return { answers: answers.map(AnswerPresenter.toHTTP) };
    }
} 