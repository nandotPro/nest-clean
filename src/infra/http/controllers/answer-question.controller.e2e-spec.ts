import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AnswerFactory } from "test/factories/make-answer";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-student";

describe('Answer Question (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let answerFactory: AnswerFactory;
    let jwt: JwtService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory, AnswerFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        answerFactory = moduleRef.get(AnswerFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[POST] /questions/:questionId/answers', async () => {
        const user = await studentFactory.makePrismaStudent();
        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const attachment1 = await prisma.attachments.create({
            data: {
                title: 'Attachment 1',
                url: 'attachment-1.jpg',
            }
        });

        const attachment2 = await prisma.attachments.create({
            data: {
                title: 'Attachment 2', 
                url: 'attachment-2.jpg',
            }
        });

        const questionId = question.id.toString();
        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .post(`/questions/${questionId}/answers`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Nova resposta',
                attachments: [attachment1.id, attachment2.id]
            });

        expect(response.status).toBe(201);

        const answerOnDatabase = await prisma.answers.findFirst({
            where: {
                content: 'Nova resposta',
            },
        });

        expect(answerOnDatabase).toBeTruthy();

        const attachmentsOnDatabase = await prisma.attachments.findMany({
            where: {
                answersId: answerOnDatabase?.id
            }
        });

        expect(attachmentsOnDatabase).toHaveLength(2);
    });

    test('[POST] /questions/:questionId/answers - Unauthorized', async () => {
        const user = await studentFactory.makePrismaStudent();
        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const questionId = question.id.toString();

        const response = await request(app.getHttpServer())
            .post(`/questions/${questionId}/answers`)
            .send({
                content: 'Nova resposta',
            });

        expect(response.status).toBe(401);
    });
});