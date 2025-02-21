import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { QuestionAttachment } from "@/domain/forum/enterprise/entities/question-attachment";
import { Attachments as PrismaAttachment, Prisma } from "@prisma/client";

export class PrismaQuestionAttachmentMapper {
    static toDomain(raw: PrismaAttachment): QuestionAttachment {
        if (!raw.questionsId) {
            throw new Error('Invalid attachment type');
        }

        return QuestionAttachment.create({
            attachmentId: new UniqueEntityID(raw.id),
            questionId: new UniqueEntityID(raw.questionsId),
        }, new UniqueEntityID(raw.id));
    }

    static toPrismaUpdateMany(attachments: QuestionAttachment[]): Prisma.AttachmentsUpdateManyArgs[] {
        const attachmentIds = attachments.map((attachment) => {
            return attachment.id.toString();
        });

        return {
            where: {
                id: { in: attachmentIds },
            },
            data: {
                questionsId: attachments[0].questionId.toString(),
            },
        };
    }       
} 