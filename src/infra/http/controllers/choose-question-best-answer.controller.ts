import { BadRequestException, Controller, HttpCode, Param, Patch, ForbiddenException, NotFoundException, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ChooseQuestionBestAnswerUseCase } from "@/domain/forum/application/use-cases/choose-question-best-answer";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";

@Controller('/answers/:answerId/choose-as-best')
@UseGuards(JwtAuthGuard)
export class ChooseQuestionBestAnswerController {
    constructor(private chooseQuestionBestAnswer: ChooseQuestionBestAnswerUseCase) {}

    @Patch()
    @HttpCode(204)
    async handle(
        @CurrentUser() user: UserPayload,
        @Param('answerId') answerId: string,
    ) {
        const userId = user.sub;

        const result = await this.chooseQuestionBestAnswer.execute({
            authorId: userId,
            answerId,
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