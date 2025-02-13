import { AggregateRoot } from "@/core/entities/aggregate-root";
import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface NotificationProps {
    recipientId: UniqueEntityID;
    title: string;
    content: string;
    createdAt: Date;
    readAt?: Date;
}

export class Notification extends AggregateRoot<NotificationProps> {
    get recipientId() {
        return this.props.recipientId;
    }

    get title() {
        return this.props.title;
    }

    get content() {
        return this.props.content;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    get readAt() {
        return this.props.readAt;
    }

    read() {
        this.props.readAt = new Date();
    }

    static create(props: Optional<NotificationProps, 'createdAt'>, id?: UniqueEntityID) {
        const notification = new Notification({
            ...props,
            createdAt: props.createdAt ?? new Date(),
        }, id);

        return notification;
    }
}