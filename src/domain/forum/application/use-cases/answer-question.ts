import { Either, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Answer } from "../../enterprise/entities/answer";
import { AnswersRepository } from "../repositories/answers-repository";
import { AnswerAttachmentList } from "../../enterprise/entities/answer-attachment-list";
import { AnswerAttachment } from "../../enterprise/entities/answer-attachment";
import { Injectable } from "@nestjs/common";
interface AnswerQuestionRequest {
    instructorId: string;
    questionId: string;
    content: string;
    attachmentsIds: string[];   
}

type AnswerQuestionResponse = Either<
    null,
    {
        answer: Answer;
    }
>

@Injectable()
export class AnswerQuestionUseCase {
    constructor(private answersRepository: AnswersRepository) {}

    async execute({ instructorId, questionId, content, attachmentsIds }: AnswerQuestionRequest): Promise<AnswerQuestionResponse> {
        const answer = Answer.create({ 
            content, 
            authorId: new UniqueEntityID(instructorId), 
            questionId: new UniqueEntityID(questionId)
        });

        const answerAttachments = attachmentsIds.map((attachmentId) => {
            return AnswerAttachment.create({
                attachmentId: new UniqueEntityID(attachmentId),
                answerId: answer.id
            });
        });

        answer.attachments = new AnswerAttachmentList(answerAttachments);

        await this.answersRepository.create(answer);

        return right({ answer });
    }
}