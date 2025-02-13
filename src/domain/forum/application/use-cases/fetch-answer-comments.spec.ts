import { InMemoryAnswerCommentsRepository } from "test/repositories/in-memory-answer-comments-repository";
import { FetchAnswerCommentsUseCase } from "./fetch-answer-comments";
import { makeAnswerComment } from "test/factories/make-answer-comments";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let sut: FetchAnswerCommentsUseCase;

describe("FetchAnswerCommentsUseCase", () => {
    beforeEach(() => {
        inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository();
        sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository);
    });

    it("should fetch answer comments", async () => {
        await inMemoryAnswerCommentsRepository.create(makeAnswerComment({
            answerId: new UniqueEntityID("1"),
        }));
        await inMemoryAnswerCommentsRepository.create(makeAnswerComment({
            answerId: new UniqueEntityID("1"),
        }));
        await inMemoryAnswerCommentsRepository.create(makeAnswerComment({
            answerId: new UniqueEntityID("1"),
        }));

        const result = await sut.execute({ page: 1, answerId: "1" });
        
        expect(result.value?.comments).toHaveLength(3);
    });

    it("should fetch paginated answer comments", async () => {
        for (let i = 1; i <= 22; i++) {
            await inMemoryAnswerCommentsRepository.create(makeAnswerComment({
                answerId: new UniqueEntityID("1"),
            }));
        }

        const result = await sut.execute({ page: 2, answerId: "1" });
        
        expect(result.value?.comments).toHaveLength(2);
    });
});
