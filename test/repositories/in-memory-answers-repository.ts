import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswersRepository } from "../../src/domain/forum/application/repositories/answers-repository";
import { Answer } from "../../src/domain/forum/enterprise/entities/answer";
import { AnswerAttachmentsRepository } from "@/domain/forum/application/repositories/answer-attachments-repository";
import { DomainEvents } from "@/core/events/domain-events";

export class InMemoryAnswersRepository implements AnswersRepository {
    public answers: Answer[] = [];

    constructor(private answerAttachmentsRepository: AnswerAttachmentsRepository) {}

    async create(answer: Answer): Promise<void> {
        this.answers.push(answer);

        await this.answerAttachmentsRepository.createMany(answer.attachments.getItems());

        DomainEvents.dispatchEventsForAggregate(answer.id)
    }

    async findById(id: string): Promise<Answer | null> {
        const answer = this.answers.find((answer) => answer.id.toString() === id);

        if (!answer) {
            return null;
        }

        return answer;
    }

    async save(answer: Answer): Promise<void> {
        const answerIndex = this.answers.findIndex((a) => a.id === answer.id);

        if (answerIndex === -1) {
            throw new Error("Answer not found.");
        }

        this.answers[answerIndex] = answer;

        await this.answerAttachmentsRepository.deleteMany(answer.attachments.getItems());

        await this.answerAttachmentsRepository.createMany(answer.attachments.getItems());

        DomainEvents.dispatchEventsForAggregate(answer.id)
    }

    async delete(answer: Answer): Promise<void> {
        const itemIndex = this.answers.findIndex((a) => a.id === answer.id);

        this.answers.splice(itemIndex, 1);

        this.answerAttachmentsRepository.deleteManyByAnswerId(answer.id.toString());
    }

    async findManyByQuestionId(questionId: string, { page}: PaginationParams): Promise<Answer[]> {
        const answers = this.answers.filter((answer) => answer.questionId
        .toString() === questionId)
        .slice((page - 1) * 20, page * 20);

        return answers;
    }

    findAll(): Answer[] {
        return this.answers;
    }
}