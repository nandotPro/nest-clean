import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import { FetchQuestionAnswersUseCase } from "./fetch-question-answers";
import { makeAnswer } from "test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachment-repository";

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let sut: FetchQuestionAnswersUseCase;

describe("FetchQuestionAnswersUseCase", () => {
    beforeEach(() => {
        inMemoryAnswerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
        inMemoryAnswersRepository = new InMemoryAnswersRepository(inMemoryAnswerAttachmentsRepository);
        sut = new FetchQuestionAnswersUseCase(inMemoryAnswersRepository);
    });

    it("should fetch question answers", async () => {
        await inMemoryAnswersRepository.create(makeAnswer({
            questionId: new UniqueEntityID("1"),
        }));
        await inMemoryAnswersRepository.create(makeAnswer({
            questionId: new UniqueEntityID("1"),
        }));
        await inMemoryAnswersRepository.create(makeAnswer({
            questionId: new UniqueEntityID("1"),
        }));

        const result = await sut.execute({ page: 1, questionId: "1" });
        
        expect(result.value?.answers).toHaveLength(3);
    });

    it("should fetch paginated question answers", async () => {
        for (let i = 1; i <= 22; i++) {
            await inMemoryAnswersRepository.create(makeAnswer({
                questionId: new UniqueEntityID("1"),
            }));
        }

        const result = await sut.execute({ page: 2, questionId: "1" });
        
        expect(result.value?.answers).toHaveLength(2);
    }); 
});
