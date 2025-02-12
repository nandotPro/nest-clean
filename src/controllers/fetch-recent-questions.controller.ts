import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

const pageQueryParamSchema = z.object({
    page: z.string().optional().default('1').transform(Number),
    size: z.string().optional().default('20').transform(Number),
});

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
    constructor(private prisma: PrismaService) {}

    @Get()
    async handle(@Query(queryValidationPipe) query: PageQueryParamSchema) {
        const perPage = query.size;
        const skip = (query.page - 1) * perPage;

        const questions = await this.prisma.questions.findMany({
            take: perPage,
            skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return { questions };
    }
}