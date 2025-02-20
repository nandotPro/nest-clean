import { Attachments as PrismaAttachment } from "@prisma/client";
import { Attachment } from "@/domain/forum/enterprise/entities/attachment";
import { Prisma } from "@prisma/client";

export class PrismaAttachmentMapper {
    static toPrisma(attachment: Attachment): Prisma.AttachmentsUncheckedCreateInput  {
        return {
            id: attachment.id.toString(),
            title: attachment.title,
            url: attachment.link,
            questionsId: null,
            answersId: null,
        };
    }       
}
