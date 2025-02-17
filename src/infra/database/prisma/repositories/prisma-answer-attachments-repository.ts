import { Injectable } from "@nestjs/common";
import { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";
import { AnswerAttachmentsRepository } from "@/domain/forum/application/repositories/answer-attachments-repository";
import { PrismaService } from "../prisma.service";
import { PrismaAnswerAttachmentMapper } from "../mappers/prisma-answer-attachment-mapper";

@Injectable()
export class PrismaAnswerAttachmentsRepository implements AnswerAttachmentsRepository {
    constructor(private prisma: PrismaService) {}

    async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
        const attachments = await this.prisma.attachments.findMany({
            where: {
                answersId: answerId,
            },
        });

        return attachments.map(PrismaAnswerAttachmentMapper.toDomain);
    }

    async deleteManyByAnswerId(answerId: string): Promise<void> {
        await this.prisma.attachments.deleteMany({
            where: {
                answersId: answerId,
            },
        });
    }
}