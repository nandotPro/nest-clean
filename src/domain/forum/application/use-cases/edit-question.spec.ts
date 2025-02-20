import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { EditQuestionUseCase } from "./edit-question";
import { makeQuestion } from "test/factories/make-question";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { makeQuestionAttachment } from "test/factories/make-question-attachments";

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let sut: EditQuestionUseCase;

describe("EditQuestionUseCase", () => {
    beforeEach(() => {
        inMemoryQuestionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
        inMemoryQuestionsRepository = new InMemoryQuestionsRepository(inMemoryQuestionAttachmentsRepository);
        sut = new EditQuestionUseCase(inMemoryQuestionsRepository, inMemoryQuestionAttachmentsRepository);
    });

    it("should be able to edit a question", async () => {
        const newQuestion = makeQuestion({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("question-1"));

        await inMemoryQuestionsRepository.create(newQuestion);

        inMemoryQuestionAttachmentsRepository.attachments.push(
            makeQuestionAttachment({
                questionId: newQuestion.id,
                attachmentId: new UniqueEntityID("1")
            }),
            makeQuestionAttachment({
                questionId: newQuestion.id,
                attachmentId: new UniqueEntityID("2")
            })
        );

        await sut.execute({
            questionId: newQuestion.id.toString(),
            authorId: "author-1",
            title: "Test question",
            content: "Test content",
            attachmentsIds: ["1", "3"]
        });

        expect(inMemoryQuestionsRepository.questions[0]).toMatchObject({
            title: "Test question",
            content: "Test content",
        });
        expect(inMemoryQuestionsRepository.questions[0].attachments.currentItems).toHaveLength(2);
        expect(inMemoryQuestionsRepository.questions[0].attachments.currentItems).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("3") }),
        ]);
    });

    it("should not be able to edit a question from another user", async () => {
        const newQuestion = makeQuestion({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("question-1"));

        await inMemoryQuestionsRepository.create(newQuestion);
        
        const result = await sut.execute({
            questionId: "question-1",
            authorId: "author-2",
            title: "Test question",
            content: "Test content",
            attachmentsIds: []
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });

    it("should sync new and removed attachments when a question is edited", async () => {
        const newQuestion = makeQuestion({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("question-1"));

        await inMemoryQuestionsRepository.create(newQuestion);

        inMemoryQuestionAttachmentsRepository.attachments.push(
            makeQuestionAttachment({
                questionId: newQuestion.id,
                attachmentId: new UniqueEntityID("1")
            }),
            makeQuestionAttachment({
                questionId: newQuestion.id,
                attachmentId: new UniqueEntityID("2")
            })
        );

        const result = await sut.execute({
            questionId: newQuestion.id.toString(),
            authorId: "author-1",
            title: "Test question",
            content: "Test content",
            attachmentsIds: ["1", "3"]
        });

        expect(result.isRight()).toBe(true);

        expect(inMemoryQuestionsRepository.questions[0]).toMatchObject({
            title: "Test question",
            content: "Test content",
        });
        expect(inMemoryQuestionsRepository.questions[0].attachments.currentItems).toHaveLength(2);
        expect(inMemoryQuestionsRepository.questions[0].attachments.currentItems).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("3") }),
        ]);
    });
});
