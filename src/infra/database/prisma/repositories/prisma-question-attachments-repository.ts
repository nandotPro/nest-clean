import { Injectable } from "@nestjs/common";
import { QuestionAttachmentsRepository } from "@/domain/forum/application/repositories/question-attachments-repository";
import { QuestionAttachment } from "@/domain/forum/enterprise/entities/question-attachment";
import { PrismaService } from "../prisma.service";
import { PrismaQuestionAttachmentMapper } from "../mappers/prisma-question-attachment-mapper";

@Injectable()
export class PrismaQuestionAttachmentsRepository implements QuestionAttachmentsRepository {    
    constructor(private prisma: PrismaService) {}

    async createMany(attachments: QuestionAttachment[]): Promise<void> {
        if (attachments.length === 0) {
            return;
        }

        const data = PrismaQuestionAttachmentMapper.toPrismaUpdateMany(attachments);

        await this.prisma.attachments.updateMany(data);
    }

    async deleteMany(attachments: QuestionAttachment[]): Promise<void> {
        if (attachments.length === 0) {
            return;
        }

        const attachmentIds = attachments.map((attachment) => attachment.id.toString());

        await this.prisma.attachments.deleteMany({
            where: {
                id: { in: attachmentIds },
            },
        });
    }

    async findManyByQuestionId(questionId: string): Promise<QuestionAttachment[]> {
        const attachments = await this.prisma.attachments.findMany({
            where: {
                questionsId: questionId,
            },
        });

        return attachments.map(PrismaQuestionAttachmentMapper.toDomain);
    }

    async deleteManyByQuestionId(questionId: string): Promise<void> {
        await this.prisma.attachments.deleteMany({
            where: {
                questionsId: questionId,
            },
        });
    }
}