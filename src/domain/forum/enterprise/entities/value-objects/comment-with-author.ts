import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ValueObject } from "@/core/entities/value-object";

interface CommentWithAuthorProps {
    commentId: UniqueEntityID;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt?: Date | null;    
    author: string;
}

export class CommentWithAuthor extends ValueObject<CommentWithAuthorProps> {
    get commentId() {
        return this.props.commentId;
    }

    get content() {
        return this.props.content;
    }

    get authorId() {
        return this.props.authorId;
    }
    
    get createdAt() {
        return this.props.createdAt;
    }

    get updatedAt() {
        return this.props.updatedAt;
    }   

    get author() {
        return this.props.author;
    }

    static create(props: CommentWithAuthorProps) {
        return new CommentWithAuthor(props);
    }   
}   