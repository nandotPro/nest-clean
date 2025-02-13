import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository";
import { ReadNotificationUseCase } from "./read-notification";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeNotification } from "test/factories/make-notification";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";

let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let sut: ReadNotificationUseCase;

describe("ReadNotificationUseCase", () => {
    beforeEach(() => {
        inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
        sut = new ReadNotificationUseCase(inMemoryNotificationsRepository);
    });

    it("should read a notification", async () => {
        const notification = makeNotification();

        inMemoryNotificationsRepository.create(notification);

        const result = await sut.execute({
            recipientId: notification.recipientId.toString(),
            notificationId: notification.id.toString(),
        });

        expect(result.isRight()).toBe(true);
        expect(inMemoryNotificationsRepository.notifications[0].readAt).toEqual(expect.any(Date));
    });

    it("should not be able to read another user's notification", async () => {
        const notification = makeNotification({
            recipientId: new UniqueEntityID("recipient-1"),
        });

        inMemoryNotificationsRepository.create(notification);

        const result = await sut.execute({
            recipientId: "recipient-2",
            notificationId: notification.id.toString(),
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});