import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Attachment } from "@/domain/forum/enterprise/entities/attachment";
import { Attachments as PrismaAttachment } from "@prisma/client";

export class PrismaAttachmentMapper {
    static toDomain(raw: PrismaAttachment): Attachment {
        return Attachment.create(
            {
                title: raw.title,
                link: raw.url,
            },
            new UniqueEntityID(raw.id)
        );
    }

    static toPrisma(attachment: Attachment): PrismaAttachment {
        return {
            id: attachment.id.toString(),
            title: attachment.title,
            url: attachment.link,
            questionsId: null,
            answersId: null,
        };
    }
}
