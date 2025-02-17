import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { StudentFactory } from "test/factories/make-student";
import request from "supertest";
import { hash } from "bcryptjs";

describe('Authenticate (E2E)', () => {
    let app: INestApplication;
    let studentFactory: StudentFactory;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        studentFactory = moduleRef.get(StudentFactory);

        await app.init();
    });

    test('[POST] /sessions', async () => {
        await studentFactory.makePrismaStudent({
            email: 'johndoe1@example.com',
            password: await hash('123456', 8),
        });

        const response = await request(app.getHttpServer())
            .post('/sessions')
            .send({
                email: 'johndoe1@example.com',
                password: '123456',
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            access_token: expect.any(String),
        });
    });

    test('[POST] /sessions - Wrong credentials', async () => {
        await studentFactory.makePrismaStudent({
            email: 'johndoe2@example.com',
            password: await hash('123456', 8),
        });

        const response = await request(app.getHttpServer())
            .post('/sessions')
            .send({
                email: 'johndoe2@example.com',
                password: 'wrong-password',
            });

        expect(response.status).toBe(401);
    });
});
