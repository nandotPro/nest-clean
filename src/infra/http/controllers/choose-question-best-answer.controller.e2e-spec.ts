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

describe('Choose Question Best Answer (E2E)', () => {
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

    test('[PATCH] /answers/:answerId/choose-as-best', async () => {
        const user = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            questionId: question.id,
            authorId: user.id,
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const answerId = answer.id.toString();

        const response = await request(app.getHttpServer())
            .patch(`/answers/${answerId}/choose-as-best`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(204);

        const questionOnDatabase = await prisma.questions.findUnique({
            where: {
                id: question.id.toString(),
            },
        });

        expect(questionOnDatabase?.bestAnswerId).toEqual(answerId);
    });

    test('[PATCH] /answers/:answerId/choose-as-best - Should not be able to choose another user question best answer', async () => {
        const user = await studentFactory.makePrismaStudent();
        const anotherUser = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: anotherUser.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            questionId: question.id,
            authorId: user.id,
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const answerId = answer.id.toString();

        const response = await request(app.getHttpServer())
            .patch(`/answers/${answerId}/choose-as-best`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(403);
    });

    test('[PATCH] /answers/:answerId/choose-as-best - Unauthorized', async () => {
        const user = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            questionId: question.id,
            authorId: user.id,
        });

        const answerId = answer.id.toString();

        const response = await request(app.getHttpServer())
            .patch(`/answers/${answerId}/choose-as-best`)
            .send();

        expect(response.status).toBe(401);
    });
}); 