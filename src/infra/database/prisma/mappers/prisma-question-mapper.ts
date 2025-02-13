import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Questions as PrismaQuestion } from "@prisma/client";
import { Question } from "src/domain/forum/enterprise/entities/question";
import { Slug } from "src/domain/forum/enterprise/entities/value-objects/slug";

export class PrismaQuestionMapper {
    static toDomain(raw: PrismaQuestion): Question {
        return Question.create({
            title: raw.title,
            content: raw.content,
            authorId: new UniqueEntityID(raw.authorId),
            bestAnswerId: undefined,
            slug: Slug.create(raw.title),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        }, new UniqueEntityID(raw.id));
    }
}