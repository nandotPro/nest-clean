import { Injectable } from "@nestjs/common";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswerCommentsRepository } from "@/domain/forum/application/repositories/answer-comments-repository";
import { AnswerComment } from "@/domain/forum/enterprise/entities/answer-comment";
import { PrismaService } from "../prisma.service";
import { PrismaAnswerCommentMapper } from "../mappers/prisma-answer-comment-mapper";
import { PrismaCommentWithAuthorMapper } from "../mappers/prisma-comment-with-author-mapper";
import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";

@Injectable()
export class PrismaAnswerCommentsRepository implements AnswerCommentsRepository {
    constructor(private prisma: PrismaService) {}

    async create(answerComment: AnswerComment): Promise<void> {
        const data = PrismaAnswerCommentMapper.toPrisma(answerComment);

        await this.prisma.comments.create({
            data,
        });
    }

    async findById(id: string): Promise<AnswerComment | null> {
        const comment = await this.prisma.comments.findUnique({
            where: {
                id,
            },
        });

        if (!comment) {
            return null;
        }

        return PrismaAnswerCommentMapper.toDomain(comment);
    }

    async delete(answerComment: AnswerComment): Promise<void> {
        await this.prisma.comments.delete({
            where: {
                id: answerComment.id.toString(),
            },
        });
    }

    async findManyByAnswerId(answerId: string, { page }: PaginationParams): Promise<AnswerComment[]> {
        const comments = await this.prisma.comments.findMany({
            where: {
                answersId: answerId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
            skip: (page - 1) * 20,
        });

        return comments.map(PrismaAnswerCommentMapper.toDomain);
    }

    async findManyByAnswerIdWithAuthor(answerId: string, { page }: PaginationParams): Promise<CommentWithAuthor[]> {
        const comments = await this.prisma.comments.findMany({
            where: {
                answersId: answerId,
            },
            include: {
                author: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
            skip: (page - 1) * 20,
        });

        return comments.map(PrismaCommentWithAuthorMapper.toDomain);
    }
}   