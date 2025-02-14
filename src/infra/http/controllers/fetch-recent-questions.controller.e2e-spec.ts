import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe('Fetch Recent Questions (E2E)', () => {
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

    test('[GET] /questions', async () => {
        const user = await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: '123456',
            },
        });

        const accessToken = jwt.sign({ sub: user.id });

        await prisma.questions.createMany({
            data: [
                {
                    title: 'Pergunta 1',
                    slug: 'Pergunta 1',
                    content: 'Conteúdo da pergunta 1',
                    authorId: user.id,
                },
                {
                    title: 'Pergunta 2',
                    slug: 'Pergunta 2',
                    content: 'Conteúdo da pergunta 2',
                    authorId: user.id,
                },
            ],
        });

        const response = await request(app.getHttpServer())
            .get('/questions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.questions).toHaveLength(2);
        expect(response.body.questions).toEqual([
            expect.objectContaining({
                title: 'Pergunta 1',
                slug: 'Pergunta 1',
            }),
            expect.objectContaining({
                title: 'Pergunta 2',
                slug: 'Pergunta 2',
            }),
        ]);
    });

    test('[GET] /questions - Unauthorized', async () => {
        const response = await request(app.getHttpServer())
            .get('/questions')
            .send();

        expect(response.status).toBe(401);
    });
}); 