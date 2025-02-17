import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AnswerComment } from "@/domain/forum/enterprise/entities/answer-comment";
import { Comments as PrismaComment, Prisma } from "@prisma/client";

export class PrismaAnswerCommentMapper {
    static toDomain(raw: PrismaComment): AnswerComment {
        if (!raw.answersId) {
            throw new Error('Invalid comment type');
        }

        return AnswerComment.create({
            content: raw.content,
            authorId: new UniqueEntityID(raw.authorId),
            answerId: new UniqueEntityID(raw.answersId),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        }, new UniqueEntityID(raw.id));
    }

    static toPrisma(answerComment: AnswerComment): Prisma.CommentsUncheckedCreateInput {
        return {
            id: answerComment.id.toString(),
            content: answerComment.content,
            authorId: answerComment.authorId.toString(),
            answersId: answerComment.answerId.toString(),
            createdAt: answerComment.createdAt,
            updatedAt: answerComment.updatedAt,
        };
    }   
} 