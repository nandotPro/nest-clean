import { Body, Controller, HttpCode, Post, UnauthorizedException, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { AuthenticateStudentUseCase } from "@/domain/forum/application/use-cases/authenticate-student";

const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

type AuthenticateBody = z.infer<typeof authenticateBodySchema>;

@Controller('/sessions')
export class AuthenticateController {
    constructor(
        private authenticateStudent: AuthenticateStudentUseCase,
    ) {}

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(authenticateBodySchema))
    async handle(@Body() body: AuthenticateBody) {
        const { email, password } = body;

        const result = await this.authenticateStudent.execute({
            email,
            password,
        });

        if (result.isLeft()) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { accessToken } = result.value;

        return {
            access_token: accessToken,
        }
    }
}
