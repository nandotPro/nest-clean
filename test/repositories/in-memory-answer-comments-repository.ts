import { AnswerCommentsRepository } from "@/domain/forum/application/repositories/answer-comments-repository";
import { AnswerComment } from "@/domain/forum/enterprise/entities/answer-comment";
import { PaginationParams } from "@/core/repositories/pagination-params";

export class InMemoryAnswerCommentsRepository implements AnswerCommentsRepository {
    public comments: AnswerComment[] = [];

    async create(answerComment: AnswerComment): Promise<void> {
        this.comments.push(answerComment);
    }

    async findById(id: string): Promise<AnswerComment | null> {
        const comment = this.comments.find(comment => comment.id.toString() === id);
        return comment || null;
    }

    async delete(answerComment: AnswerComment): Promise<void> {
        this.comments = this.comments.filter(comment => comment.id !== answerComment.id);
    }

    async findManyByAnswerId(answerId: string, { page }: PaginationParams): Promise<AnswerComment[]> {
        return this.comments
            .filter(comment => comment.answerId.toString() === answerId)
            .slice((page - 1) * 20, page * 20);
    }
}
