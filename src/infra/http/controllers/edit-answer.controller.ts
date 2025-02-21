import { BadRequestException, Body, Controller, ForbiddenException, HttpCode, NotFoundException, Param, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { EditAnswerUseCase } from "@/domain/forum/application/use-cases/edit-answer";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";

const editAnswerBodySchema = z.object({
    content: z.string(),
    attachments: z.array(z.string()).optional(),
});

const bodyValidationPipe = new ZodValidationPipe(editAnswerBodySchema);

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>;

@Controller('/answers/:id')
@UseGuards(JwtAuthGuard)
export class EditAnswerController {
    constructor(private editAnswer: EditAnswerUseCase) {}

    @Put()
    @HttpCode(204)
    async handle(
        @Body(bodyValidationPipe) body: EditAnswerBodySchema,
        @CurrentUser() user: UserPayload,
        @Param('id') answerId: string,
    ) {
        const { content, attachments } = body;
        const userId = user.sub;

        const result = await this.editAnswer.execute({
            answerId,
            authorId: userId,
            content,
            attachmentsIds: attachments ?? [],
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