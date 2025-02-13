import { Either, left, right } from "@/core/either";
import { Question } from "../../enterprise/entities/question";
import { QuestionsRepository } from "../repositories/questions-repository";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { QuestionAttachmentsRepository } from "../repositories/question-attachments-repository";
import { QuestionAttachmentList } from "../../enterprise/entities/question-attachment-list";
import { QuestionAttachment } from "../../enterprise/entities/question-attachment";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface EditQuestionRequest {
    questionId: string;
    authorId: string;
    title: string;
    content: string;
    attachmentsIds: string[];
}

type EditQuestionResponse = Either<
    ResourceNotFoundError | NotAllowedError,
    {
        question: Question;
    }
>

export class EditQuestionUseCase {
    constructor(
        private questionsRepository: QuestionsRepository,
        private questionAttachmentsRepository: QuestionAttachmentsRepository
    ) {}

    async execute({ questionId, authorId, title, content, attachmentsIds }: EditQuestionRequest): Promise<EditQuestionResponse> {
        const question = await this.questionsRepository.findById(questionId);

        if (!question) {
            return left(new ResourceNotFoundError());
        }

        if (authorId !== question.authorId.toString()) {
            return left(new NotAllowedError());
        }

        const currentQuestionAttachments = await this.questionAttachmentsRepository.findManyByQuestionId(questionId);
        const questionAttachmentList = new QuestionAttachmentList(currentQuestionAttachments);

        const questionAttachments = attachmentsIds.map((attachmentId) => {
            return QuestionAttachment.create({
                attachmentId: new UniqueEntityID(attachmentId),
                questionId: question.id
            });
        });

        questionAttachmentList.update(questionAttachments);

        question.title = title;
        question.content = content;
        question.attachments = questionAttachmentList;
        
        await this.questionsRepository.save(question);

        return right({
            question
        });
    }
}