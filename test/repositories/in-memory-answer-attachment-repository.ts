import { AnswerAttachmentsRepository } from "@/domain/forum/application/repositories/answer-attachments-repository";
import { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";

export class InMemoryAnswerAttachmentsRepository implements AnswerAttachmentsRepository {
    public attachments: AnswerAttachment[] = [];

    async createMany(attachments: AnswerAttachment[]): Promise<void> {
        this.attachments.push(...attachments);
    }
    async deleteMany(attachments: AnswerAttachment[]): Promise<void> {
        this.attachments = this.attachments.filter((attachment) => {
            return !attachments.includes(attachment);
        });
    }
    
    async findManyByAnswerId(answerId: string) {
        const answerAttachments = this.attachments.filter(attachment => attachment.answerId.toString() === answerId);
        return answerAttachments;
    }

    async deleteManyByAnswerId(answerId: string) {
        const answerAttachments = this.attachments.filter(attachment => attachment.answerId.toString() !== answerId);
        this.attachments = answerAttachments;
    }
}
