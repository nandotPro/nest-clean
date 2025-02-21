import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import { EditAnswerUseCase } from "./edit-answer";
import { makeAnswer } from "test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachment-repository";
import { makeAnswerAttachment } from "test/factories/make-answer-attachment";

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let sut: EditAnswerUseCase;

describe("EditAnswerUseCase", () => {
    beforeEach(() => {
        inMemoryAnswerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
        inMemoryAnswersRepository = new InMemoryAnswersRepository(inMemoryAnswerAttachmentsRepository);
        sut = new EditAnswerUseCase(inMemoryAnswersRepository, inMemoryAnswerAttachmentsRepository);
    });

    it("should be able to edit a answer", async () => {
        const newAnswer = makeAnswer({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("answer-1"));

        await inMemoryAnswersRepository.create(newAnswer);

        inMemoryAnswerAttachmentsRepository.attachments.push(
            makeAnswerAttachment({
                answerId: newAnswer.id,
                attachmentId: new UniqueEntityID("1")
            }),
            makeAnswerAttachment({
                answerId: newAnswer.id,
                attachmentId: new UniqueEntityID("2")
            })
        );

        await sut.execute({
            answerId: newAnswer.id.toString(),
            authorId: "author-1",
            content: "Test content",
            attachmentsIds: ["1", "3"]
        });

        expect(inMemoryAnswersRepository.answers[0]).toMatchObject({
            content: "Test content",
        });
        expect(inMemoryAnswersRepository.answers[0].attachments.currentItems).toHaveLength(2);
        expect(inMemoryAnswersRepository.answers[0].attachments.currentItems).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("3") }),
        ]);
    });

    it("should not be able to edit a answer from another user", async () => {
        const newAnswer = makeAnswer({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("answer-1"));

        await inMemoryAnswersRepository.create(newAnswer);
        
        const result = await sut.execute({
            answerId: "answer-1",
            authorId: "author-2",
            content: "Test content",
            attachmentsIds: []
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });

    it("should sync new and removed attachments when a answer is edited", async () => {
        const newAnswer = makeAnswer({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("answer-1"));

        await inMemoryAnswersRepository.create(newAnswer);

        inMemoryAnswerAttachmentsRepository.attachments.push(
            makeAnswerAttachment({
                answerId: newAnswer.id,
                attachmentId: new UniqueEntityID("1")
            }),
            makeAnswerAttachment({
                answerId: newAnswer.id,
                attachmentId: new UniqueEntityID("2")
            })
        );

        const result = await sut.execute({
            answerId: newAnswer.id.toString(),
            authorId: "author-1",
            content: "Test content",
            attachmentsIds: ["1", "3"]
        });

        expect(result.isRight()).toBe(true);

        expect(inMemoryAnswersRepository.answers[0]).toMatchObject({
            content: "Test content",
        });
         expect(inMemoryAnswersRepository.answers[0].attachments.currentItems).toHaveLength(2);
        expect(inMemoryAnswersRepository.answers[0].attachments.currentItems).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("3") }),
        ]);
    });
});
