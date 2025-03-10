import { BadRequestException, Controller, Delete, ForbiddenException, HttpCode, NotFoundException, Param, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { DeleteQuestionUseCase } from "@/domain/forum/application/use-cases/delete-question";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";

@Controller('/questions/:id')
@UseGuards(JwtAuthGuard)
export class DeleteQuestionController {
    constructor(private deleteQuestion: DeleteQuestionUseCase) {}

    @Delete()
    @HttpCode(204)
    async handle(
        @CurrentUser() user: UserPayload,
        @Param('id') questionId: string,
    ) {
        const userId = user.sub;

        const result = await this.deleteQuestion.execute({
            questionId,
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