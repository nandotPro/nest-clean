import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-student";
import { AttachmentFactory } from "test/factories/make-attachment";
import { QuestionAttachmentFactory } from "test/factories/make-question-attachments";

describe('Edit Question (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let attachmentFactory: AttachmentFactory;
    let questionAttachmentFactory: QuestionAttachmentFactory;
    let jwt: JwtService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory, AttachmentFactory, QuestionAttachmentFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        attachmentFactory = moduleRef.get(AttachmentFactory);
        questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[PUT] /questions/:id', async () => {
        const user = await studentFactory.makePrismaStudent();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const attachment1 = await attachmentFactory.makePrismaAttachment({
            title: 'Anexo 1',
            link: 'https://example.com/attachment1',
        });

        const attachment2 = await attachmentFactory.makePrismaAttachment({
            title: 'Anexo 2',
            link: 'https://example.com/attachment2',
        });

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            questionId: question.id,
            attachmentId: attachment1.id,
        });

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            questionId: question.id,
            attachmentId: attachment2.id,
        });

        const attachment3 = await attachmentFactory.makePrismaAttachment({
            title: 'Anexo 3',
            link: 'https://example.com/attachment3',
        });

        const questionId = question.id.toString();

        const response = await request(app.getHttpServer())
            .put(`/questions/${questionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Pergunta editada',
                content: 'Conteúdo editado',
                attachments: [
                    attachment1.id.toString(),
                    attachment3.id.toString(),
                ],
            });

        expect(response.status).toBe(204);

        const questionOnDatabase = await prisma.questions.findFirst({
            where: {
                title: 'Pergunta editada',
                content: 'Conteúdo editado',
            },
        });

        expect(questionOnDatabase).toBeTruthy();

        const attachmentsOnDatabase = await prisma.attachments.findMany({
            where: {
                questionsId: questionOnDatabase?.id,
            },
        });

        expect(attachmentsOnDatabase).toHaveLength(2);
        expect(attachmentsOnDatabase[0].id).toEqual(attachment1.id.toString());
        expect(attachmentsOnDatabase[1].id).toEqual(attachment3.id.toString());
    });

    test('[PUT] /questions/:id - Should not be able to edit question from another user', async () => {
        const user = await studentFactory.makePrismaStudent();
        const anotherUser = await studentFactory.makePrismaStudent();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const question = await questionFactory.makePrismaQuestion({
            authorId: anotherUser.id,
        });

        const questionId = question.id.toString();

        const response = await request(app.getHttpServer())
            .put(`/questions/${questionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Pergunta editada',
                content: 'Conteúdo editado',
            });

        expect(response.status).toBe(403);
    });

    test('[PUT] /questions/:id - Unauthorized', async () => {
        const user = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const questionId = question.id.toString();

        const response = await request(app.getHttpServer())
            .put(`/questions/${questionId}`)
            .send({
                title: 'Pergunta editada',
                content: 'Conteúdo editado',
            });

        expect(response.status).toBe(401);
    });
});
