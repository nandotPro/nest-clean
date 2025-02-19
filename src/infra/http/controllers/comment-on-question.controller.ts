import { BadRequestException, Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { CommentOnQuestionUseCase } from "@/domain/forum/application/use-cases/comment-on-question";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";

const commentOnQuestionBodySchema = z.object({
    content: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(commentOnQuestionBodySchema);

type CommentOnQuestionBodySchema = z.infer<typeof commentOnQuestionBodySchema>;

@Controller('/questions/:questionId/comments')
@UseGuards(JwtAuthGuard)
export class CommentOnQuestionController {
    constructor(private commentOnQuestion: CommentOnQuestionUseCase) {}

    @Post()
    async handle(
        @Body(bodyValidationPipe) body: CommentOnQuestionBodySchema,
        @CurrentUser() user: UserPayload,
        @Param('questionId') questionId: string,
    ) {
        const { content } = body;
        const userId = user.sub;

        const result = await this.commentOnQuestion.execute({
            content,
            questionId,
            authorId: userId,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new BadRequestException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
} 