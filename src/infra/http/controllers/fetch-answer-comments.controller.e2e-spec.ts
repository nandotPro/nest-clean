import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AnswerFactory } from "test/factories/make-answer";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-student";
import { AnswerCommentFactory } from "test/factories/make-answer-comments";

describe('Fetch Answer Comments (E2E)', () => {
    let app: INestApplication;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let answerFactory: AnswerFactory;
    let answerCommentFactory: AnswerCommentFactory;
    let jwt: JwtService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory, AnswerFactory, AnswerCommentFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        answerFactory = moduleRef.get(AnswerFactory);
        answerCommentFactory = moduleRef.get(AnswerCommentFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[GET] /answers/:answerId/comments', async () => {
        const user = await studentFactory.makePrismaStudent();
        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });
        const answer = await answerFactory.makePrismaAnswer({
            authorId: user.id,
            questionId: question.id,
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        await answerCommentFactory.makePrismaAnswerComment({
            authorId: user.id,
            answerId: answer.id,
            content: 'Comment 1',
        });

        await answerCommentFactory.makePrismaAnswerComment({
            authorId: user.id,
            answerId: answer.id,
            content: 'Comment 2',
        });

        const response = await request(app.getHttpServer())
            .get(`/answers/${answer.id.toString()}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            comments: expect.arrayContaining([
                expect.objectContaining({
                    content: 'Comment 1',
                }),
                expect.objectContaining({
                    content: 'Comment 2',
                }),
            ]),
        });
    });

    test('[GET] /answers/:answerId/comments - Unauthorized', async () => {
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
            .get(`/answers/${answerId}/comments`)
            .send();

        expect(response.status).toBe(401);
    });
}); 