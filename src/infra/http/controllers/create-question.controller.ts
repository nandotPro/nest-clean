import { Body, Controller, HttpCode, Post, UseGuards, BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { CreateQuestionUseCase } from "@/domain/forum/application/use-cases/create-question";

const createQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema);

type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>;

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(private createQuestion: CreateQuestionUseCase) {}

    @Post()
    @HttpCode(201)
    async handle(
        @CurrentUser() user: UserPayload,
        @Body(bodyValidationPipe) body: CreateQuestionBody
    ) {
        const { title, content } = body;
        const userId = user.sub;

        const result = await this.createQuestion.execute({
            title,
            content,
            authorId: userId,
            attachmentsIds: [],
        });

        if (result.isLeft()) {
            throw new BadRequestException('Unexpected error');
        }
    }
}