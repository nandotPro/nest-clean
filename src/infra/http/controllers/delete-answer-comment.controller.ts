import { BadRequestException, Controller, Delete, ForbiddenException, HttpCode, NotFoundException, Param, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { DeleteAnswerCommentUseCase } from "@/domain/forum/application/use-cases/delete-answer-comment";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";

@Controller('/answers/comments/:id')
@UseGuards(JwtAuthGuard)
export class DeleteAnswerCommentController {
    constructor(private deleteAnswerComment: DeleteAnswerCommentUseCase) {}

    @Delete()
    @HttpCode(204)
    async handle(
        @CurrentUser() user: UserPayload,
        @Param('id') answerCommentId: string,
    ) {
        const userId = user.sub;

        const result = await this.deleteAnswerComment.execute({
            answerCommentId,
            authorId: userId,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException();
                case NotAllowedError:
                    throw new ForbiddenException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
} 