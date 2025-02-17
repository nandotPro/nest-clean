import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { StudentFactory } from "test/factories/make-student";
import { QuestionFactory } from "test/factories/make-question";
import request from "supertest";

describe('Fetch Recent Questions (E2E)', () => {
    let app: INestApplication;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let jwt: JwtService;
    
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

    test('[GET] /questions', async () => {
        const user = await studentFactory.makePrismaStudent();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        await questionFactory.makePrismaQuestion({
            title: 'Question 01',
            content: 'Question content',
            authorId: user.id,
        });

        await questionFactory.makePrismaQuestion({
            title: 'Question 02',
            content: 'Question content 2',
            authorId: user.id,
        });

        const response = await request(app.getHttpServer())
            .get('/questions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.questions).toHaveLength(2);
        expect(response.body.questions).toEqual([
            expect.objectContaining({ title: 'Question 02' }),
            expect.objectContaining({ title: 'Question 01' }),
        ]);
    });

    test('[GET] /questions - Unauthorized', async () => {
        const response = await request(app.getHttpServer())
            .get('/questions')
            .send();

        expect(response.status).toBe(401);
    });
}); 