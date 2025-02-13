import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { hash } from "bcryptjs";

describe('Authenticate (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        
        prisma = moduleRef.get(PrismaService);

        await app.init();
    });

    test('[POST] /sessions', async () => {
        // Criar um usuário para testar autenticação
        const hashedPassword = await hash('123456', 8);

        await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: hashedPassword,
            },
        });

        const response = await request(app.getHttpServer())
            .post('/sessions')
            .send({
                email: 'johndoe@example.com',
                password: '123456',
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            access_token: expect.any(String),
        });
    });

    test('[POST] /sessions - Wrong credentials', async () => {
        const response = await request(app.getHttpServer())
            .post('/sessions')
            .send({
                email: 'johndoe@example.com',
                password: 'wrong-password',
            });

        expect(response.status).toBe(401);
    });
});
