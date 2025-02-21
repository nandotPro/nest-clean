import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { StudentFactory } from "test/factories/make-student";
import request from "supertest";
import { AttachmentFactory } from "test/factories/make-attachment";

describe('Create Question (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let attachmentFactory: AttachmentFactory;
    let jwt: JwtService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, AttachmentFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        
        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);
        studentFactory = moduleRef.get(StudentFactory);
        attachmentFactory = moduleRef.get(AttachmentFactory);

        await app.init();
    });

    test('[POST] /questions', async () => {
        const user = await studentFactory.makePrismaStudent();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const attachment1 = await attachmentFactory.makePrismaAttachment({
            title: 'Anexo 1',
            link: 'https://example.com/attachment1',
        });

        const attachment2 = await attachmentFactory.makePrismaAttachment({
            title: 'Anexo 2',
            link: 'https://example.com/attachment2',
        });

        const response = await request(app.getHttpServer())
            .post('/questions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Nova pergunta',
                content: 'Conteúdo da pergunta',
                attachments: [
                    attachment1.id.toString(),
                    attachment2.id.toString(),
                ],
            });

        expect(response.status).toBe(201);

        const questionOnDatabase = await prisma.questions.findFirst({
            where: {
                title: 'Nova pergunta',
            },
        });

        expect(questionOnDatabase).toBeTruthy();
        expect(questionOnDatabase?.slug).toEqual('nova-pergunta');

        const attachmentsOnDatabase = await prisma.attachments.findMany({
            where: {
                questionsId: questionOnDatabase?.id,
            },
        });

        expect(attachmentsOnDatabase).toHaveLength(2);
        expect(attachmentsOnDatabase[0].id).toEqual(attachment1.id);
        expect(attachmentsOnDatabase[1].id).toEqual(attachment2.id);
    });

    test('[POST] /questions - Unauthorized', async () => {
        const response = await request(app.getHttpServer())
            .post('/questions')
            .send({
                title: 'Nova pergunta',
                content: 'Conteúdo da pergunta',
            });

        expect(response.status).toBe(401);
    });
}); 