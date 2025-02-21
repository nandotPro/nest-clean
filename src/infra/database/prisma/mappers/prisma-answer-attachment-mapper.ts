import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";
import { Attachments as PrismaAttachment, Prisma } from "@prisma/client";

export class PrismaAnswerAttachmentMapper {
    static toDomain(raw: PrismaAttachment): AnswerAttachment {
        if (!raw.answersId) {
            throw new Error('Invalid attachment type');
        }

        return AnswerAttachment.create({
            attachmentId: new UniqueEntityID(raw.id),
            answerId: new UniqueEntityID(raw.answersId),
        }, new UniqueEntityID(raw.id));
    } 

    static toPrismaUpdateMany(attachments: AnswerAttachment[]): Prisma.AttachmentsUpdateManyArgs {
        const attachmentIds = attachments.map((attachment) => {
            return attachment.attachmentId.toString();
        });

        return {
            where: {
                id: { in: attachmentIds },
            },
            data: {
                answersId: attachments[0].answerId.toString(),
            },
        };
    }   
} 