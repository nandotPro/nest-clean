import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository";
import { SendNotificationUseCase } from "./send-notification";

let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let sut: SendNotificationUseCase;

describe("SendNotificationUseCase", () => {
    beforeEach(() => {
        inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
        sut = new SendNotificationUseCase(inMemoryNotificationsRepository);
    });

    it("should create a notification", async () => {
        const result = await sut.execute({
            recipientId: "1",
            title: "Nova Notificação",
            content: "Conteúdo da notificação",
        });

        expect(result.isRight()).toBe(true);
        expect(inMemoryNotificationsRepository.notifications[0]).toEqual(result.value?.notification);
    });
});