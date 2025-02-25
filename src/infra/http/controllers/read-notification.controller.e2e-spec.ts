import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { StudentFactory } from "test/factories/make-student";
import { NotificationFactory } from "test/factories/make-notification";

describe('Read Notification (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let notificationFactory: NotificationFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, NotificationFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        notificationFactory = moduleRef.get(NotificationFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[PATCH] /notifications/:notificationId/read', async () => {
        const user = await studentFactory.makePrismaStudent();

        const notification = await notificationFactory.makePrismaNotification({
            recipientId: user.id,
        });

        const notificationId = notification.id.toString();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .patch(`/notifications/${notificationId}/read`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(204);

        const notificationOnDatabase = await prisma.notification.findFirst({
            where: {
                recipientId: user.id.toString(),
            },
        });

        expect(notificationOnDatabase?.readAt).not.toBeNull();
    });

    test('[PATCH] /notifications/:notificationId/read - Should not be able to read another user notification', async () => {
        const user = await studentFactory.makePrismaStudent();
        const anotherUser = await studentFactory.makePrismaStudent();

        const notification = await notificationFactory.makePrismaNotification({
            recipientId: anotherUser.id,
        });

        const notificationId = notification.id.toString();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .patch(`/notifications/${notificationId}/read`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(400);
    });

    test('[PATCH] /notifications/:notificationId/read - Unauthorized', async () => {
        const notification = await notificationFactory.makePrismaNotification();

        const notificationId = notification.id.toString();

        const response = await request(app.getHttpServer())
            .patch(`/notifications/${notificationId}/read`)
            .send();

        expect(response.status).toBe(401);
    });
}); 