import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question.details";
import { Questions as PrismaQuestion, Attachments as PrismaAttachment, User as PrismaUser } from "@prisma/client";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { PrismaAttachmentMapper } from "./prisma-attachment-mapper";

type PrismaQuestionDetails = PrismaQuestion & {
    attachments: PrismaAttachment[];
    author: PrismaUser;
};

export class PrismaQuestionDetailsMapper {
    static toDomain(raw: PrismaQuestionDetails): QuestionDetails {
        return QuestionDetails.create({
            questionId: new UniqueEntityID(raw.id),
            authorId: new UniqueEntityID(raw.authorId),
            author: raw.author.name,
            title: raw.title,
            slug: raw.slug,
            content: raw.content,
            attachments: raw.attachments.map(PrismaAttachmentMapper.toDomain),
            bestAnswerId: raw.bestAnswerId ? new UniqueEntityID(raw.bestAnswerId) : null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}   
