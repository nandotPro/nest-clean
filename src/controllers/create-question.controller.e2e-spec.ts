import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { hash } from "bcryptjs";

describe('Create Question (E2E)', () => {
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

    test('[POST] /questions', async () => {
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

        const response = await request(app.getHttpServer())
            .post('/questions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Nova pergunta',
                content: 'Conteúdo da pergunta',
            });

        expect(response.status).toBe(201);

        const questionOnDatabase = await prisma.questions.findFirst({
            where: {
                title: 'Nova pergunta',
            },
        });

        expect(questionOnDatabase).toBeTruthy();
        expect(questionOnDatabase?.slug).toEqual('nova-pergunta');
    });

    test('[POST] /questions - Unauthorized', async () => {
        const response = await request(app.getHttpServer())
            .post('/questions')
            .send({
                title: 'Nova pergunta',
                content: 'Conteúdo da pergunta',
            });

        expect(response.status).toBe(401);
    });
}); 