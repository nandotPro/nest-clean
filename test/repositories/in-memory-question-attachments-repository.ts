import { QuestionAttachmentsRepository } from "@/domain/forum/application/repositories/question-attachments-repository";
import { QuestionAttachment } from "@/domain/forum/enterprise/entities/question-attachment";

export class InMemoryQuestionAttachmentsRepository implements QuestionAttachmentsRepository {
    public attachments: QuestionAttachment[] = [];
    
    async createMany(attachments: QuestionAttachment[]): Promise<void> {
        this.attachments.push(...attachments);
    }
    async deleteMany(attachments: QuestionAttachment[]): Promise<void> {
        this.attachments = this.attachments.filter((attachment) => {
            return !attachments.includes(attachment);
        });
    }
    async findManyByQuestionId(questionId: string) {
        const questionAttachments = this.attachments.filter(attachment => attachment.questionId.toString() === questionId);
        return questionAttachments;
    }

    async deleteManyByQuestionId(questionId: string) {
        const questionAttachments = this.attachments.filter(attachment => attachment.questionId.toString() !== questionId);
        this.attachments = questionAttachments;
    }
}
