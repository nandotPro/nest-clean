import { InMemoryQuestionsCommentsRepository } from "test/repositories/in-memory-question-comments-repository";
import { FetchQuestionCommentsUseCase } from "./fetch-question-comments";
import { makeQuestionComment } from "test/factories/make-question-comment";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryQuestionCommentsRepository: InMemoryQuestionsCommentsRepository;
let sut: FetchQuestionCommentsUseCase;

describe("FetchQuestionCommentsUseCase", () => {
    beforeEach(() => {
        inMemoryQuestionCommentsRepository = new InMemoryQuestionsCommentsRepository();
        sut = new FetchQuestionCommentsUseCase(inMemoryQuestionCommentsRepository);
    });

    it("should fetch question comments", async () => {
        await inMemoryQuestionCommentsRepository.create(makeQuestionComment({
            questionId: new UniqueEntityID("1"),
        }));
        await inMemoryQuestionCommentsRepository.create(makeQuestionComment({
            questionId: new UniqueEntityID("1"),
        }));
        await inMemoryQuestionCommentsRepository.create(makeQuestionComment({
            questionId: new UniqueEntityID("1"),
        }));

        const result = await sut.execute({ page: 1, questionId: "1" });
        
        expect(result.value?.comments).toHaveLength(3);
    });

    it("should fetch paginated question comments", async () => {
        for (let i = 1; i <= 22; i++) {
            await inMemoryQuestionCommentsRepository.create(makeQuestionComment({
                questionId: new UniqueEntityID("1"),
            }));
        }

        const result = await sut.execute({ page: 2, questionId: "1" });
        
        expect(result.value?.comments).toHaveLength(2);
    });
});
