import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { StudentFactory } from "test/factories/make-student";
import { QuestionFactory } from "test/factories/make-question";
import { DatabaseModule } from "@/infra/database/database.module";
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug";
import { AttachmentFactory } from "test/factories/make-attachment";
import { QuestionAttachmentFactory } from "test/factories/make-question-attachments";

describe('Get Question By Slug (E2E)', () => {
    let app: INestApplication;
    let studentFactory: StudentFactory;
    let jwt: JwtService;
    let questionFactory: QuestionFactory;
    let attachmentFactory: AttachmentFactory;
    let questionAttachmentFactory: QuestionAttachmentFactory;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        jwt = moduleRef.get(JwtService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        attachmentFactory = moduleRef.get(AttachmentFactory);
        questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory);


        await app.init();
    });

    test('[GET] /questions/:slug', async () => {
        const user = await studentFactory.makePrismaStudent();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const question = await questionFactory.makePrismaQuestion({
            title: 'Question 01',
            slug: Slug.create('question-01'),
            content: 'Question content',
            authorId: user.id,
        });

        const attachment = await attachmentFactory.makePrismaAttachment({
            title: 'Attachment 01',
        });

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            questionId: question.id,
            attachmentId: attachment.id,
        });

        const response = await request(app.getHttpServer())
            .get('/questions/question-01')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            question: expect.objectContaining({
                id: expect.any(String),
                title: 'Question 01',
                content: 'Question content',
                slug: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                authorId: expect.any(String),
                bestAnswerId: expect.any(String),
                attachments: expect.any(Array),
            }),
        });
    });

    test('[GET] /questions/:slug - Question not found', async () => {
        const user = await studentFactory.makePrismaStudent();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .get('/questions/non-existing-question')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(400);
    });

    test('[GET] /questions/:slug - Unauthorized', async () => {
        const response = await request(app.getHttpServer())
            .get('/questions/any-question')
            .send();

        expect(response.status).toBe(401);
    });
}); 