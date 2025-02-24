import { BadRequestException, Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { FetchQuestionCommentsUseCase } from "@/domain/forum/application/use-cases/fetch-question-comments";
import { CommentWithAuthorPresenter } from "../presenters/comment-with-author-presenter";

const pageQueryParamSchema = z.object({
    page: z.string().optional().default('1').transform(Number),
});

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller('/questions/:questionId/comments')
@UseGuards(JwtAuthGuard)
export class FetchQuestionCommentsController {
    constructor(private fetchQuestionComments: FetchQuestionCommentsUseCase) {}

    @Get()
    async handle(
        @Query(queryValidationPipe) query: PageQueryParamSchema,
        @Param('questionId') questionId: string,
    ) {
        const result = await this.fetchQuestionComments.execute({
            page: query.page,
            questionId,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        const comments = result.value.comments;

        return { comments: comments.map(CommentWithAuthorPresenter.toHTTP) };
    }
} 