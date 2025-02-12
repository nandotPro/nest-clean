import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CurrentUser } from "src/auth/current-user-decorator";
import { UserPayload } from "src/auth/jwt.strategy";

const createQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema);

type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>;

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(private jwt: JwtService, private prisma: PrismaService) {}

    @Post()
    @HttpCode(201)
    async handle(
        @CurrentUser() user: UserPayload,
        @Body(bodyValidationPipe) body: CreateQuestionBody
    ) {
        const { title, content } = body;
        const userId = user.sub;

        const slug = this.convertToSlug(title);

        await this.prisma.questions.create({
            data: {
                title,
                content,
                authorId: userId,
                slug,
            },
        });
    }

    private convertToSlug(title: string): string {
        return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
    }
}