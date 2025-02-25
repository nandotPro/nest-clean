import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question.details";

export class QuestionDetailsPresenter {
    static toHTTP(question: QuestionDetails) {
        return {
            id: question.questionId.toString(),
            title: question.title,
            content: question.content,
            authorId: question.authorId.toString(),
            bestAnswerId: question.bestAnswerId?.toString(),
            attachments: question.attachments.map((attachment) => ({
                id: attachment.id.toString(),
                title: attachment.title,
                link: attachment.link,
            })),
            createdAt: question.createdAt,
            updatedAt: question.updatedAt,
        };
    }
}
