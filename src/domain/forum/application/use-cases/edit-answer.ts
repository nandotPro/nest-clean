import { Either, left, right } from "@/core/either";
import { Answer } from "../../enterprise/entities/answer";
import { AnswersRepository } from "../repositories/answers-repository";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AnswerAttachment } from "../../enterprise/entities/answer-attachment";
import { AnswerAttachmentList } from "../../enterprise/entities/answer-attachment-list";
import { AnswerAttachmentsRepository } from "../repositories/answer-attachments-repository";
import { Injectable } from "@nestjs/common";

interface EditAnswerRequest {
    answerId: string;
    authorId: string;
    content: string;
    attachmentsIds: string[];
}

type EditAnswerResponse = Either<
    ResourceNotFoundError | NotAllowedError,
    {
        answer: Answer;
    }
>

@Injectable()
export class EditAnswerUseCase {
    constructor(
        private answersRepository: AnswersRepository,
        private answerAttachmentsRepository: AnswerAttachmentsRepository
    ) {}

    async execute({ answerId, authorId, content, attachmentsIds }: EditAnswerRequest): Promise<EditAnswerResponse> {
        const answer = await this.answersRepository.findById(answerId);

        if (!answer) {
            return left(new ResourceNotFoundError());
        }

        if (authorId !== answer.authorId.toString()) {
            return left(new NotAllowedError());
        }

        answer.content = content;

        const currentAnswerAttachments = await this.answerAttachmentsRepository.findManyByAnswerId(answerId);
        const answerAttachmentList = new AnswerAttachmentList(currentAnswerAttachments);

        const answerAttachments = attachmentsIds.map((attachmentId) => {
            return AnswerAttachment.create({
                attachmentId: new UniqueEntityID(attachmentId),
                answerId: answer.id
            });
        });

        answerAttachmentList.update(answerAttachments);

        answer.attachments = answerAttachmentList;
        answer.content = content;

        await this.answersRepository.save(answer);

        return right({
            answer
        });
    }
}