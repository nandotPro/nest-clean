import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { QuestionComment } from "@/domain/forum/enterprise/entities/question-comment";
import { Comments as PrismaComment, Prisma } from "@prisma/client";

export class PrismaQuestionCommentMapper {
    static toDomain(raw: PrismaComment): QuestionComment {
        if (!raw.questionsId) {
            throw new Error('Invalid comment type');
        }

        return QuestionComment.create({
            content: raw.content,
            authorId: new UniqueEntityID(raw.authorId),
            questionId: new UniqueEntityID(raw.questionsId),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        }, new UniqueEntityID(raw.id));
    }

    static toPrisma(questionComment: QuestionComment): Prisma.CommentsUncheckedCreateInput {
        return {
            id: questionComment.id.toString(),
            content: questionComment.content,
            authorId: questionComment.authorId.toString(),
            questionsId: questionComment.questionId.toString(),
            createdAt: questionComment.createdAt,
            updatedAt: questionComment.updatedAt,
        };
    }   
} 