import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Answer } from "@/domain/forum/enterprise/entities/answer";
import { Answers as PrismaAnswer, Prisma } from "@prisma/client";

export class PrismaAnswerMapper {
    static toDomain(raw: PrismaAnswer): Answer {
        return Answer.create({
            content: raw.content,
            authorId: new UniqueEntityID(raw.authorId),
            questionId: new UniqueEntityID(raw.questionsId),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        }, new UniqueEntityID(raw.id));
    }

    static toPrisma(answer: Answer): Prisma.AnswersUncheckedCreateInput {
        return {
            id: answer.id.toString(),
            content: answer.content,
            authorId: answer.authorId.toString(),
            questionsId: answer.questionId.toString(),
            createdAt: answer.createdAt,
            updatedAt: answer.updatedAt,
        };
    }   
} 