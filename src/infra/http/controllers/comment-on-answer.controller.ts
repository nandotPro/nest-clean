import { BadRequestException, Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { CommentOnAnswerUseCase } from "@/domain/forum/application/use-cases/comment-on-answer";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";

const commentOnAnswerBodySchema = z.object({
    content: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(commentOnAnswerBodySchema);

type CommentOnAnswerBodySchema = z.infer<typeof commentOnAnswerBodySchema>;

@Controller('/answers/:answerId/comments')
@UseGuards(JwtAuthGuard)
export class CommentOnAnswerController {
    constructor(private commentOnAnswer: CommentOnAnswerUseCase) {}

    @Post()
    async handle(
        @Body(bodyValidationPipe) body: CommentOnAnswerBodySchema,
        @CurrentUser() user: UserPayload,
        @Param('answerId') answerId: string,
    ) {
        const { content } = body;
        const userId = user.sub;

        const result = await this.commentOnAnswer.execute({
            content,
            answerId,
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