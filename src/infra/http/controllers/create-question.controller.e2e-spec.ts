import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { StudentFactory } from "test/factories/make-student";
import request from "supertest";

describe('Create Question (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let jwt: JwtService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);
        studentFactory = moduleRef.get(StudentFactory);

        await app.init();
    });

    test('[POST] /questions', async () => {
        const user = await studentFactory.makePrismaStudent();

        const accessToken = jwt.sign({ sub: user.id.toString() });

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