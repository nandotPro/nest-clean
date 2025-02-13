import { Either, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Question } from "../../enterprise/entities/question";
import { QuestionsRepository } from "../repositories/questions-repository";
import { QuestionAttachment } from "../../enterprise/entities/question-attachment";
import { QuestionAttachmentList } from "../../enterprise/entities/question-attachment-list";

interface CreateQuestionRequest {
    authorId: string;
    title: string;
    content: string;
    attachmentsIds: string[];
}

type CreateQuestionResponse = Either<
    null,
    {
        question: Question;
    }
>

export class CreateQuestionUseCase {
    constructor(private questionsRepository: QuestionsRepository) {}

    async execute({ authorId, title, content, attachmentsIds }: CreateQuestionRequest): Promise<CreateQuestionResponse> {
        const question = Question.create({
            title,
            content,
            authorId: new UniqueEntityID(authorId)
        });

        const questionAttachments = attachmentsIds.map((attachmentId) => {
            return QuestionAttachment.create({
                attachmentId: new UniqueEntityID(attachmentId),
                questionId: question.id
            });
        });

        question.attachments = new QuestionAttachmentList(questionAttachments);

        await this.questionsRepository.create(question);

        return right({
            question
        });
    }
}
