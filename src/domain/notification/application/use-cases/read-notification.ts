import { Either, right, left } from "@/core/either";
import { Notification } from "../../enterprise/entities/notification";
import { NotificationsRepository } from "../repositories/notifications-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";

interface ReadNotificationRequest {
    recipientId: string;
    notificationId: string;
}

type ReadNotificationResponse = Either<
    ResourceNotFoundError | NotAllowedError,
    {
        notification: Notification;
    }
>

export class ReadNotificationUseCase {
    constructor(private notificationsRepository: NotificationsRepository) {}

    async execute({ recipientId, notificationId }: ReadNotificationRequest): Promise<ReadNotificationResponse> {
        const notification = await this.notificationsRepository.findById(notificationId);

        if (!notification) {
            return left(new ResourceNotFoundError());
        }

        if (notification.recipientId.toString() !== recipientId) {
            return left(new NotAllowedError());
        }

        notification.read();

        await this.notificationsRepository.save(notification);

        return right({
            notification
        });
    }
}
