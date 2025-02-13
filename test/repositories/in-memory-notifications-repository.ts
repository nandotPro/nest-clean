import { Notification } from "@/domain/notification/enterprise/entities/notification";
import { NotificationsRepository } from "@/domain/notification/application/repositories/notifications-repository";

export class InMemoryNotificationsRepository implements NotificationsRepository {
    public notifications: Notification[] = [];

    async create(notification: Notification) {
        this.notifications.push(notification);
    }

    async findById(id: string): Promise<Notification | null> {
        const notification = this.notifications.find(notification => notification.id.toString() === id);

        if (!notification) {
            return null;
        }

        return notification;
    }

    async save(notification: Notification): Promise<void> {
        const notificationIndex = this.notifications.findIndex((n) => n.id === notification.id);

        if (notificationIndex === -1) {
            return;
        }

        this.notifications[notificationIndex] = notification;
    }


}