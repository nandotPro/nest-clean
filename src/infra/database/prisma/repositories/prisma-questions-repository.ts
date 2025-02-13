import { PaginationParams } from "@/core/repositories/pagination-params";
import { QuestionsRepository } from "src/domain/forum/application/repositories/questions-repository";
import { Question } from "src/domain/forum/enterprise/entities/question";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaQuestionMapper } from "../mappers/prisma-question-mapper";

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
    constructor(private prisma: PrismaService) {}

    async create(question: Question): Promise<void> {
        const data = PrismaQuestionMapper.toPrisma(question);

        await this.prisma.questions.create({
            data,
        });
    }

    async findBySlug(slug: string): Promise<Question | null> {
        const question = await this.prisma.questions.findUnique({
            where: {
                slug,
            },
        });

        if (!question) {
            return null;
        }

        return PrismaQuestionMapper.toDomain(question);
    }

    async findById(id: string): Promise<Question | null> {
        const question  = await this.prisma.questions.findUnique({
            where: {
                id,
            },
        });

        if (!question) {
            return null;
        }

        return PrismaQuestionMapper.toDomain(question);
    }
    
    async delete(question: Question): Promise<void> {
        const data = PrismaQuestionMapper.toPrisma(question);

        await this.prisma.questions.delete({
            where: {
                id: data.id,
            },
        });
    }

    async save(question: Question): Promise<void> {
        const data = PrismaQuestionMapper.toPrisma(question);

        await this.prisma.questions.update({
            where: {
                id: data.id,
            },
            data,
        });
    }

    async findManyRecent(params: PaginationParams): Promise<Question[]> {
        const { page } = params;

        const questions = await this.prisma.questions.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 20,
            skip: (page - 1) * 20,
        }); 

        return questions.map(PrismaQuestionMapper.toDomain);
    }
    
}
