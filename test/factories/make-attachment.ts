import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { PrismaAttachmentMapper } from "@/infra/database/prisma/mappers/prisma-attachment-mapper";
import { Attachment, AttachmentProps } from "@/domain/forum/enterprise/entities/attachment";

export function makeAttachment(
    override: Partial<AttachmentProps> = {},
    id?: UniqueEntityID,
) {
    const attachment = Attachment.create({
        title: faker.lorem.sentence(),
        link: faker.internet.url(),
        ...override
    }, id);

    return attachment;
}

@Injectable()
export class AttachmentFactory {
    constructor(private prisma: PrismaService) {}

    async makePrismaAttachment(data: Partial<AttachmentProps> = {}): Promise<Attachment> {
        const attachment = makeAttachment(data);

        await this.prisma.attachments.create({
            data: PrismaAttachmentMapper.toPrisma(attachment),
        });

        return attachment;
    }
}

