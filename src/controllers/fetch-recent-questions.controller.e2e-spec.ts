import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { hash } from "bcryptjs";

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
        // Criar um usuário e gerar token
        const hashedPassword = await hash('123456', 8);
        const user = await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: hashedPassword,
            },
        });

        const accessToken = jwt.sign({ sub: user.id });

        // Criar algumas perguntas no banco
        await prisma.questions.createMany({
            data: [
                {
                    title: 'Pergunta 1',
                    slug: 'pergunta-1',
                    content: 'Conteúdo da pergunta 1',
                    authorId: user.id,
                },
                {
                    title: 'Pergunta 2',
                    slug: 'pergunta-2',
                    content: 'Conteúdo da pergunta 2',
                    authorId: user.id,
                },
            ],
        });

        const response = await request(app.getHttpServer())
            .get('/questions')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.questions).toHaveLength(2);
        
        // Verificar apenas os campos relevantes
        expect(response.body.questions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    title: 'Pergunta 1',
                    content: 'Conteúdo da pergunta 1',
                }),
                expect.objectContaining({
                    title: 'Pergunta 2',
                    content: 'Conteúdo da pergunta 2',
                }),
            ])
        );
    });

    test('[GET] /questions - Unauthorized', async () => {
        const response = await request(app.getHttpServer())
            .get('/questions');

        expect(response.status).toBe(401);
    });

}); 