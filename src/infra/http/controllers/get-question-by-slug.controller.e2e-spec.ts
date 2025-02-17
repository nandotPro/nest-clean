import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { StudentFactory } from "test/factories/make-student";
import { QuestionFactory } from "test/factories/make-question";
import { DatabaseModule } from "@/infra/database/database.module";
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug";

describe('Get Question By Slug (E2E)', () => {
    let app: INestApplication;
    let studentFactory: StudentFactory;
    let jwt: JwtService;
    let questionFactory: QuestionFactory;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        jwt = moduleRef.get(JwtService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);

        await app.init();
    });

    test('[GET] /questions/:slug', async () => {
        const user = await studentFactory.makePrismaStudent();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        await questionFactory.makePrismaQuestion({
            title: 'Question 01',
            slug: Slug.create('question-01'),
            content: 'Question content',
            authorId: user.id,
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