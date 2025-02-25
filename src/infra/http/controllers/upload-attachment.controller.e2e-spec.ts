import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { StudentFactory } from "test/factories/make-student";
import { StorageModule } from "@/infra/storage/storage.module";

describe('Upload Attachment (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let jwt: JwtService;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule, StorageModule],
            providers: [
                StudentFactory,
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        
        // Configuração correta para multipart/form-data
        app.enableCors();
        
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[POST] /attachments', async () => {
        const user = await studentFactory.makePrismaStudent();
        const accessToken = jwt.sign({ sub: user.id.toString() });

        // Criar arquivo de teste temporário se não existir
        const fs = require('fs');
        const path = require('path');
        
        const testDir = './test/e2e';
        const filePath = path.join(testDir, 'sample-upload.jpg');
        
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        if (!fs.existsSync(filePath)) {
            // Criar um arquivo de imagem simples para teste
            const buffer = Buffer.from('fake image content');
            fs.writeFileSync(filePath, buffer);
        }

        const response = await request(app.getHttpServer())
            .post('/attachments')
            .set('Authorization', `Bearer ${accessToken}`)
            .attach('file', filePath);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            attachmentId: expect.any(String),
        });

        const attachment = await prisma.attachments.findFirst({
            where: {
                id: response.body.attachmentId,
            },
        });

        expect(attachment).toBeTruthy();
        expect(attachment?.title).toEqual('sample-upload.jpg');
    });

    test('[POST] /attachments - Invalid file type', async () => {
        const user = await studentFactory.makePrismaStudent();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .post('/attachments')
            .set('Authorization', `Bearer ${accessToken}`)
            .attach('file', './test/e2e/sample-upload.txt');

        expect(response.status).toBe(400);
    });

    test('[POST] /attachments - Large file', async () => {
        const user = await studentFactory.makePrismaStudent();
        const accessToken = jwt.sign({ sub: user.id.toString() });

        // Simular arquivo grande com um buffer
        const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB

        const response = await request(app.getHttpServer())
            .post('/attachments')
            .set('Authorization', `Bearer ${accessToken}`)
            .attach('file', largeBuffer, 'large-file.jpg');

        expect(response.status).toBe(400);
    });

    test('[POST] /attachments - Unauthorized', async () => {
        const response = await request(app.getHttpServer())
            .post('/attachments')
            .attach('file', './test/e2e/sample-upload.jpg');

        expect(response.status).toBe(401);
    });
}); 