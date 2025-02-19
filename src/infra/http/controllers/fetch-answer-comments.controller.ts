import { BadRequestException, Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { FetchAnswerCommentsUseCase } from "@/domain/forum/application/use-cases/fetch-answer-comments";
import { CommentPresenter } from "../presenters/comment-presenter";

const pageQueryParamSchema = z.object({
    page: z.string().optional().default('1').transform(Number),
});

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller('/answers/:answerId/comments')
@UseGuards(JwtAuthGuard)
export class FetchAnswerCommentsController {
    constructor(private fetchAnswerComments: FetchAnswerCommentsUseCase) {}

    @Get()
    async handle(
        @Query(queryValidationPipe) query: PageQueryParamSchema,
        @Param('answerId') answerId: string,
    ) {
        const result = await this.fetchAnswerComments.execute({
            page: query.page,
            answerId,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        const comments = result.value.comments;

        return { comments: comments.map(CommentPresenter.toHTTP) };
    }
} 