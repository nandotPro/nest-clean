import { Body, Controller, HttpCode, Post, UnauthorizedException, UsePipes, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CurrentUser } from "src/auth/current-user-decorator";
import { UserPayload } from "src/auth/jwt.strategy";

const createQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string(),
});

type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>;

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(private jwt: JwtService, private prisma: PrismaService) {}

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(createQuestionBodySchema))
    async handle(@CurrentUser() user: UserPayload) {
        

    }
}

