import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";

export class CommentWithAuthorPresenter {
    static toHTTP(comment: CommentWithAuthor) {
        return {
            id: comment.commentId.toString(),
            authorId: comment.authorId.toString(),
            content: comment.content,
            author: comment.author,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        };
    }
}
