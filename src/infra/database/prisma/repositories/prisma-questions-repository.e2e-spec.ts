import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { CacheRepository } from '@/infra/cache/cache-repository';
import { StudentFactory } from 'test/factories/make-student';
import { QuestionFactory } from 'test/factories/make-question';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { AttachmentFactory } from 'test/factories/make-attachment';
import { QuestionAttachmentFactory } from 'test/factories/make-question-attachments';

describe('PrismaQuestionsRepository (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: CacheRepository;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let attachmentFactory: AttachmentFactory;
  let questionAttachmentFactory: QuestionAttachmentFactory;
  let questionsRepository: QuestionsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    cache = moduleRef.get(CacheRepository);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory);
    questionsRepository = moduleRef.get(QuestionsRepository);

    await app.init();
  });

  beforeEach(async () => {
    // Limpar o banco de dados antes de cada teste
    await prisma.comments.deleteMany();
    await prisma.attachments.deleteMany();
    await prisma.answers.deleteMany();
    await prisma.questions.deleteMany();
    await prisma.user.deleteMany();
  });

  test('deve armazenar detalhes da pergunta em cache', async () => {
    // Espionar o método set do cache
    const setCacheSpy = vi.spyOn(cache, 'set');

    // Criar um estudante e uma pergunta  
    const user = await studentFactory.makePrismaStudent();
    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    // Criar anexos para a pergunta
    const attachment = await attachmentFactory.makePrismaAttachment();
    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachment.id,
      questionId: question.id,
    });

    // Buscar detalhes da pergunta pelo slug
    const slug = question.slug.value;
    await questionsRepository.findDetailsBySlug(slug);

    // Verificar se o cache foi chamado com a chave correta
    expect(setCacheSpy).toHaveBeenCalledWith(
      `question:${slug}:details`,
      expect.any(String),
    );
  });

  test('deve recuperar detalhes da pergunta do cache quando disponível', async () => {
    // Criar um estudante e uma pergunta
    const user = await studentFactory.makePrismaStudent();
    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const slug = question.slug.value;
    const cacheKey = `question:${slug}:details`;

    // Espionar o método get do cache
    const getCacheSpy = vi.spyOn(cache, 'get');

    // Primeira chamada - deve armazenar em cache
    const result1 = await questionsRepository.findDetailsBySlug(slug);

    // Espionar o método findUnique do prisma
    const findUniqueSpy = vi.spyOn(prisma.questions, 'findUnique');

    // Segunda chamada - deve usar o cache
    const result2 = await questionsRepository.findDetailsBySlug(slug);

    // Verificar se o cache foi consultado
    expect(getCacheSpy).toHaveBeenCalledWith(cacheKey);
    
    // Verificar se o resultado é o mesmo
    expect(result1).toEqual(result2);
    
    // Verificar se o banco de dados não foi consultado na segunda chamada
    expect(findUniqueSpy).toHaveBeenCalledTimes(1);
  });

  test('deve invalidar o cache ao salvar uma pergunta', async () => {
    // Criar um estudante e uma pergunta
    const user = await studentFactory.makePrismaStudent();
    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const slug = question.slug.value;
    const cacheKey = `question:${slug}:details`;

    // Espionar o método delete do cache
    const deleteCacheSpy = vi.spyOn(cache, 'delete');

    // Buscar detalhes da pergunta para armazenar em cache
    await questionsRepository.findDetailsBySlug(slug);

    // Atualizar a pergunta
    question.title = 'Título atualizado';
    await questionsRepository.save(question);

    // Verificar se o cache foi invalidado
    expect(deleteCacheSpy).toHaveBeenCalledWith(cacheKey);
  });

  afterAll(async () => {
    await app.close();
  });
});
