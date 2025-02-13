import { Either, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Notification } from "../../enterprise/entities/notification";
import { NotificationsRepository } from "../repositories/notifications-repository";


export interface SendNotificationRequest {
    recipientId: string;
    title: string;
    content: string;
}

export type SendNotificationResponse = Either<
    null,
    {
        notification: Notification;
    }
>

export class SendNotificationUseCase {
    constructor(private notificationsRepository: NotificationsRepository) {}

    async execute({ recipientId, title, content }: SendNotificationRequest): Promise<SendNotificationResponse> {
        const notification = Notification.create({
            title,
            content,
            recipientId: new UniqueEntityID(recipientId)
        });

        await this.notificationsRepository.create(notification);

        return right({
            notification
        });
    }
}
