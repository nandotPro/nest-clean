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
import { waitFor } from "test/utils/wait-for";

describe('On Answer Created (E2E)', () => {
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

    it('should create a notification when answer is created', async () => {
        const user = await studentFactory.makePrismaStudent();
        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        await request(app.getHttpServer())
            .post(`/questions/${question.id.toString()}/answers`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Nova resposta',
            });

        await waitFor(async () => {
            const notificationOnDatabase = await prisma.notification.findFirst({
                where: {
                    recipientId: user.id.toString(),
                },
            });

            expect(notificationOnDatabase).toBeTruthy();
            expect(notificationOnDatabase?.title).toContain('Nova Resposta');
        });
    });

    it('should create a notification when answer is chosen as best', async () => {
        const student = await studentFactory.makePrismaStudent();
        const answerer = await studentFactory.makePrismaStudent();

        const question = await questionFactory.makePrismaQuestion({
            authorId: student.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            authorId: answerer.id,
            questionId: question.id,
        });

        const accessToken = jwt.sign({ sub: student.id.toString() });

        await request(app.getHttpServer())
            .patch(`/answers/${answer.id.toString()}/choose-as-best`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        await waitFor(async () => {
            const notificationOnDatabase = await prisma.notification.findFirst({
                where: {
                    recipientId: answerer.id.toString(),
                },
            });

            expect(notificationOnDatabase).toBeTruthy();
            expect(notificationOnDatabase?.title).toEqual('Sua resposta foi escolhida como a melhor.');
        });
    });

    afterAll(async () => {
        await app.close();
    });
});