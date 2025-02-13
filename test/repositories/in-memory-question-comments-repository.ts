import { QuestionCommentsRepository } from "@/domain/forum/application/repositories/question-comments-repository";
import { QuestionComment } from "@/domain/forum/enterprise/entities/question-comment";
import { PaginationParams } from "@/core/repositories/pagination-params";

export class InMemoryQuestionsCommentsRepository implements QuestionCommentsRepository {
    public comments: QuestionComment[] = [];

    async create(questionComment: QuestionComment): Promise<void> {
        this.comments.push(questionComment);
    }

    async findById(id: string): Promise<QuestionComment | null> {
        const comment = this.comments.find(comment => comment.id.toString() === id);
        return comment || null;
    }

    async delete(questionComment: QuestionComment): Promise<void> {
        this.comments = this.comments.filter(comment => comment.id !== questionComment.id);
    }

    async findManyByQuestionId(questionId: string, { page }: PaginationParams): Promise<QuestionComment[]> {
        return this.comments
            .filter(comment => comment.questionId.toString() === questionId)
            .slice((page - 1) * 20, page * 20);
    }
}
