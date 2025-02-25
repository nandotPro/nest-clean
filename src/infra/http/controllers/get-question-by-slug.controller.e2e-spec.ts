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
            providers: [
                StudentFactory, 
                QuestionFactory,
                AttachmentFactory,
                QuestionAttachmentFactory
            ],
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

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
            title: 'Question title',
            slug: Slug.createFromText('question-title'),
        });

        const response = await request(app.getHttpServer())
            .get(`/questions/${question.slug.value}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            question: expect.objectContaining({
                title: 'Question title',
                slug: 'question-title',
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