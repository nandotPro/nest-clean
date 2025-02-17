import { Question, QuestionProps } from "@/domain/forum/enterprise/entities/question";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { PrismaQuestionMapper } from "@/infra/database/prisma/mappers/prisma-question-mapper";

export function makeQuestion(
    override: Partial<QuestionProps> = {},
    id?: UniqueEntityID,
) {
    const question = Question.create({
        authorId: new UniqueEntityID("1"),
        title: faker.lorem.sentence(),
        content: faker.lorem.text(),
        ...override
    }, id);

    return question;
}

@Injectable()
export class QuestionFactory {
    constructor(private prisma: PrismaService) {}

    async makePrismaQuestion(data: Partial<QuestionProps> = {}): Promise<Question> {
        const question = makeQuestion(data);

        await this.prisma.questions.create({
            data: PrismaQuestionMapper.toPrisma(question),
        });

        return question;
    }
}