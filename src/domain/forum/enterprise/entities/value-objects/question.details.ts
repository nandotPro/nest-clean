import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ValueObject } from "@/core/entities/value-object";
import { Attachment } from "@/domain/forum/enterprise/entities/attachment";

interface QuestionDetailsProps {
    authorId: UniqueEntityID;
    questionId: UniqueEntityID;  
    title: string;
    content: string;
    author: string;
    slug: string;
    attachments: Attachment[];
    bestAnswerId: UniqueEntityID | null;
    createdAt: Date;
    updatedAt?: Date | null;
}

export class QuestionDetails extends ValueObject<QuestionDetailsProps> {
    static create(props: QuestionDetailsProps) {
        return new QuestionDetails(props);
    }

    get questionId() {
        return this.props.questionId;
    }

    get authorId() {
        return this.props.authorId;
    }

    get author() {
        return this.props.author;
    }

    get title() {
        return this.props.title;
    }

    get slug() {
        return this.props.slug;
    }

    get content() {
        return this.props.content;
    }

    get attachments() {
        return this.props.attachments;
    }

    get bestAnswerId() {
        return this.props.bestAnswerId;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    get updatedAt() {
        return this.props.updatedAt;
    }
}   