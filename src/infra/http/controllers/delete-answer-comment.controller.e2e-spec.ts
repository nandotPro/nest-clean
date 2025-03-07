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
import { AnswerCommentFactory } from "test/factories/make-answer-comments";

describe('Delete Answer Comment (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
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
        
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        answerFactory = moduleRef.get(AnswerFactory);
        answerCommentFactory = moduleRef.get(AnswerCommentFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[DELETE] /answers/comments/:id', async () => {
        const user = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            questionId: question.id,
            authorId: user.id,
        });

        const answerComment = await answerCommentFactory.makePrismaAnswerComment({
            authorId: user.id,
            answerId: answer.id,
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const commentId = answerComment.id.toString();

        const response = await request(app.getHttpServer())
            .delete(`/answers/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(204);

        const commentOnDatabase = await prisma.comments.findUnique({
            where: {
                id: commentId,
            },
        });

        expect(commentOnDatabase).toBeNull();
    });

    test('[DELETE] /answers/comments/:id - Should not be able to delete another user comment', async () => {
        const user = await studentFactory.makePrismaStudent();
        const anotherUser = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            questionId: question.id,
            authorId: user.id,
        });

        const answerComment = await answerCommentFactory.makePrismaAnswerComment({
            authorId: anotherUser.id,
            answerId: answer.id,
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const commentId = answerComment.id.toString();

        const response = await request(app.getHttpServer())
            .delete(`/answers/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(403);
    });

    test('[DELETE] /answers/comments/:id - Unauthorized', async () => {
        const user = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            questionId: question.id,
            authorId: user.id,
        });

        const answerComment = await answerCommentFactory.makePrismaAnswerComment({
            authorId: user.id,
            answerId: answer.id,
        });

        const commentId = answerComment.id.toString();

        const response = await request(app.getHttpServer())
            .delete(`/answers/comments/${commentId}`)
            .send();

        expect(response.status).toBe(401);
    });
}); 