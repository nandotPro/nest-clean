import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AnswerFactory } from "test/factories/make-answer";
import { AnswerAttachmentFactory } from "test/factories/make-answer-attachment";
import { AttachmentFactory } from "test/factories/make-attachment";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-student";

describe('Edit Answer (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let answerFactory: AnswerFactory;
    let answerAttachmentFactory: AnswerAttachmentFactory;
    let attachmentFactory: AttachmentFactory;
    let jwt: JwtService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory, AnswerFactory, AnswerAttachmentFactory, AttachmentFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        answerFactory = moduleRef.get(AnswerFactory);
        answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory);
        attachmentFactory = moduleRef.get(AttachmentFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[PUT] /answers/:id', async () => {
        const user = await studentFactory.makePrismaStudent();
        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            authorId: user.id,
            questionId: question.id,
        });

        const attachment1 = await attachmentFactory.makePrismaAttachment();
        const attachment2 = await attachmentFactory.makePrismaAttachment();

        await answerAttachmentFactory.makePrismaAnswerAttachment({
            answerId: answer.id,
            attachmentId: attachment1.id,
        }); 

        await answerAttachmentFactory.makePrismaAnswerAttachment({
            answerId: answer.id,
            attachmentId: attachment2.id,
        });

        const answerId = answer.id.toString();
        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .put(`/answers/${answerId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Conteúdo editado',
                attachments: [attachment1.id.toString(), attachment2.id.toString()],
            });

        expect(response.status).toBe(204);

        const answerOnDatabase = await prisma.answers.findFirst({
            where: {
                content: 'Conteúdo editado',
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

    test('[PUT] /answers/:id - Should not be able to edit answer from another user', async () => {
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
            .put(`/answers/${answerId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Resposta editada',
            });

        expect(response.status).toBe(403);
    });

    test('[PUT] /answers/:id - Unauthorized', async () => {
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
            .put(`/answers/${answerId}`)
            .send({
                content: 'Resposta editada',
            });

        expect(response.status).toBe(401);
    });
}); 