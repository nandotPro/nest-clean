import { Answer, AnswerProps } from "@/domain/forum/enterprise/entities/answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { PrismaAnswerMapper } from "@/infra/database/prisma/mappers/prisma-answer-mapper";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

export function makeAnswer(
    override: Partial<AnswerProps> = {},
    id?: UniqueEntityID,
) {
    const answer = Answer.create({
        authorId: new UniqueEntityID("1"),
        questionId: new UniqueEntityID("1"),
        content: faker.lorem.text(),
        ...override
    }, id);

    return answer;
}

@Injectable()
export class AnswerFactory {
    constructor(private prisma: PrismaService) {}

    async makePrismaAnswer(data: Partial<AnswerProps> = {}): Promise<Answer> {
        const answer = makeAnswer(data);

        await this.prisma.answers.create({
            data: PrismaAnswerMapper.toPrisma(answer),
        });

        return answer;
    }
}
