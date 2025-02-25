import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { CreateQuestionUseCase } from "./create-question";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: CreateQuestionUseCase;

describe("CreateQuestionUseCase", () => {
    beforeEach(() => {
        inMemoryQuestionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
        inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
        inMemoryStudentsRepository = new InMemoryStudentsRepository();
        inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
            inMemoryQuestionAttachmentsRepository,
            inMemoryStudentsRepository,
            inMemoryAttachmentsRepository
        );
        sut = new CreateQuestionUseCase(inMemoryQuestionsRepository);
    });

    it("should create a question", async () => {
        const result = await sut.execute({
            authorId: "1",
            title: "Nova Pergunta",
            content: "Conteúdo da pergunta",
            attachmentsIds: ["1", "2"]
        });

        expect(result.isRight()).toBe(true);
        expect(inMemoryQuestionsRepository.questions[0]).toEqual(result.value?.question);
        expect(inMemoryQuestionsRepository.questions[0].attachments.currentItems).toHaveLength(2);
        expect(inMemoryQuestionsRepository.questions[0].attachments.currentItems).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("2") }),
        ]);
    });

    it("should persist attachments when a question is created", async () => {
        const result = await sut.execute({
            authorId: "1",
            title: "Nova Pergunta",
            content: "Conteúdo da pergunta",
            attachmentsIds: ["1", "2"]
            });

        expect(result.isRight()).toBe(true);
        expect(inMemoryQuestionsRepository.questions[0]).toEqual(result.value?.question);
        expect(inMemoryQuestionsRepository.questions[0].attachments.currentItems).toHaveLength(2);
        expect(inMemoryQuestionsRepository.questions[0].attachments.currentItems).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("2") }),
        ]);
    });
});