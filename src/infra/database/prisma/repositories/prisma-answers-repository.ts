import { Injectable } from "@nestjs/common";
import { Answer } from "@/domain/forum/enterprise/entities/answer";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswersRepository } from "@/domain/forum/application/repositories/answers-repository";
import { PrismaService } from "../prisma.service";
import { PrismaAnswerMapper } from "../mappers/prisma-answer-mapper";
import { AnswerAttachmentsRepository } from "@/domain/forum/application/repositories/answer-attachments-repository";
import { DomainEvents } from "@/core/events/domain-events";

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {    
    constructor(
        private prisma: PrismaService,
        private answerAttachmentsRepository: AnswerAttachmentsRepository
    ) {}

    async create(answer: Answer): Promise<void> {
        const data = PrismaAnswerMapper.toPrisma(answer);

        await this.prisma.answers.create({
            data,
        });

        await this.answerAttachmentsRepository.createMany(answer.attachments.getItems());

        DomainEvents.dispatchEventsForAggregate(answer.id);
    }

    async findById(id: string): Promise<Answer | null> {
        const answer = await this.prisma.answers.findUnique({
            where: {
                id,
            },
        });

        if (!answer) {
            return null;
        }

        return PrismaAnswerMapper.toDomain(answer);
    }

    async save(answer: Answer): Promise<void> {
        const data = PrismaAnswerMapper.toPrisma(answer);

        await Promise.all([
            this.prisma.answers.update({
                where: {
                    id: data.id,
                },
                data,
            }),
            this.answerAttachmentsRepository.createMany(answer.attachments.getItems()),
            this.answerAttachmentsRepository.deleteMany(answer.attachments.getRemovedItems()),
        ]);

        DomainEvents.dispatchEventsForAggregate(answer.id);
    }

    async delete(answer: Answer): Promise<void> {
        await this.prisma.answers.delete({
            where: {
                id: answer.id.toString(),
            },
        });
    }

    async findManyByQuestionId(questionId: string, { page }: PaginationParams): Promise<Answer[]> {
        const answers = await this.prisma.answers.findMany({
            where: {
                questionsId: questionId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
            skip: (page - 1) * 20,
        });

        return answers.map(PrismaAnswerMapper.toDomain);
    }
}