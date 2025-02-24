import { AnswerCommentsRepository } from "@/domain/forum/application/repositories/answer-comments-repository";
import { AnswerComment } from "@/domain/forum/enterprise/entities/answer-comment";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";
import { InMemoryStudentsRepository } from "./in-memory-students-repository";

export class InMemoryAnswerCommentsRepository implements AnswerCommentsRepository {
    public comments: AnswerComment[] = [];

    constructor(private studentsRepository: InMemoryStudentsRepository) {}

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

    async findManyByAnswerIdWithAuthor(answerId: string, { page }: PaginationParams): Promise<CommentWithAuthor[]> {
        const comments = this.comments
            .filter(comment => comment.answerId.toString() === answerId)
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
