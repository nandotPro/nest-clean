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

describe('Delete Answer (E2E)', () => {
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

    test('[DELETE] /answers/:id', async () => {
        const user = await studentFactory.makePrismaStudent();
        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            authorId: user.id,
            questionId: question.id,
        });

        const answerId = answer.id.toString();
        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .delete(`/answers/${answerId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(204);

        const answerOnDatabase = await prisma.answers.findUnique({
            where: {
                id: answerId,
            },
        });

        expect(answerOnDatabase).toBeNull();
    });

    test('[DELETE] /answers/:id - Should not be able to delete answer from another user', async () => {
        const user = await studentFactory.makePrismaStudent();
        const anotherUser = await studentFactory.makePrismaStudent();
        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            authorId: anotherUser.id,
            questionId: question.id,
        });

        const answerId = answer.id.toString();
        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .delete(`/answers/${answerId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(403);
    });

    test('[DELETE] /answers/:id - Unauthorized', async () => {
        const user = await studentFactory.makePrismaStudent();
        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            authorId: user.id,
            questionId: question.id,
        });

        const answerId = answer.id.toString();

        const response = await request(app.getHttpServer())
            .delete(`/answers/${answerId}`)
            .send();

        expect(response.status).toBe(401);
    });
}); 