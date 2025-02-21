import { QuestionCommentsRepository } from "@/domain/forum/application/repositories/question-comments-repository";
import { QuestionComment } from "@/domain/forum/enterprise/entities/question-comment";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";
import { InMemoryStudentsRepository } from "./in-memory-students-repository";

export class InMemoryQuestionsCommentsRepository implements QuestionCommentsRepository {
    public comments: QuestionComment[] = [];

    constructor(private studentsRepository: InMemoryStudentsRepository) {
    }

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

    async findManyByQuestionIdWithAuthor(questionId: string, { page }: PaginationParams): Promise<CommentWithAuthor[]> {
        const comments = this.comments
            .filter(comment => comment.questionId.toString() === questionId)
            .slice((page - 1) * 20, page * 20)
            .map(comment => {
                const author = this.studentsRepository.students.find(student => {
                    return student.id.equals(comment.authorId)
                });

                if (!author) {
                    throw new Error(`Author with ID ${comment.authorId.toString()} not found`);
                }

                return CommentWithAuthor.create({
                    commentId: comment.id,
                    content: comment.content,
                    authorId: comment.authorId.toString(),
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    author: author.name,
                }); 
            });

        return comments;
    }
}
