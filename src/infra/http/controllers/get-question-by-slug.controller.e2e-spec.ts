import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { hash } from "bcryptjs";

describe('Get Question By Slug (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwt: JwtService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        
        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[GET] /questions/:slug', async () => {
        const user = await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: await hash('123456', 8),
            },
        });

        const accessToken = jwt.sign({ sub: user.id });

        await prisma.questions.create({
            data: {
                title: 'Question 01',
                slug: 'question-01',
                content: 'Question content',
                authorId: user.id,
            },
        });

        const response = await request(app.getHttpServer())
            .get('/questions/question-01')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            question: expect.objectContaining({
                id: expect.any(String),
                title: 'Question 01',
                content: 'Question content',
                slug: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            }),
        });
    });

    test('[GET] /questions/:slug - Question not found', async () => {
        const user = await prisma.user.create({
            data: { 
                name: 'John Doe',
                email: 'johndoe2@example.com',
                password: await hash('123456', 8),
            },
        }); 

        const accessToken = jwt.sign({ sub: user.id });

        const response = await request(app.getHttpServer())
            .get('/questions/non-existing-question')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(400);
    });

    test('[GET] /questions/:slug - Unauthorized', async () => {
        const response = await request(app.getHttpServer())
            .get('/questions/any-question')
            .send();

        expect(response.status).toBe(401);
    });
}); 