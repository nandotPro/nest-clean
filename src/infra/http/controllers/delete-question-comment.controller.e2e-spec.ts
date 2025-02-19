import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-student";
import { QuestionCommentFactory } from "test/factories/make-question-comment";

describe('Delete Question Comment (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let questionCommentFactory: QuestionCommentFactory;
    let jwt: JwtService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        questionCommentFactory = moduleRef.get(QuestionCommentFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[DELETE] /questions/comments/:id', async () => {
        const user = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const questionComment = await questionCommentFactory.makePrismaQuestionComment({
            authorId: user.id,
            questionId: question.id,
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const commentId = questionComment.id.toString();

        const response = await request(app.getHttpServer())
            .delete(`/questions/comments/${commentId}`)
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

    test('[DELETE] /questions/comments/:id - Should not be able to delete another user comment', async () => {
        const user = await studentFactory.makePrismaStudent();
        const anotherUser = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const questionComment = await questionCommentFactory.makePrismaQuestionComment({
            authorId: anotherUser.id,
            questionId: question.id,
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const commentId = questionComment.id.toString();

        const response = await request(app.getHttpServer())
            .delete(`/questions/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(403);
    });

    test('[DELETE] /questions/comments/:id - Unauthorized', async () => {
        const user = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const questionComment = await questionCommentFactory.makePrismaQuestionComment({
            authorId: user.id,
            questionId: question.id,
        });

        const commentId = questionComment.id.toString();

        const response = await request(app.getHttpServer())
            .delete(`/questions/comments/${commentId}`)
            .send();

        expect(response.status).toBe(401);
    });
}); 