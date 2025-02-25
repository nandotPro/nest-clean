import { InMemoryAnswerCommentsRepository } from "test/repositories/in-memory-answer-comments-repository";
import { FetchAnswerCommentsUseCase } from "./fetch-answer-comments";
import { makeAnswerComment } from "test/factories/make-answer-comments";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { makeStudent } from "test/factories/make-student";

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: FetchAnswerCommentsUseCase;

describe("FetchAnswerCommentsUseCase", () => {
    beforeEach(() => {
        inMemoryStudentsRepository = new InMemoryStudentsRepository();
        inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(inMemoryStudentsRepository);
        sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository);
    });

    it("should fetch answer comments", async () => {
        const student = makeStudent({ name: 'John Doe' });

        await inMemoryStudentsRepository.create(student);

        await inMemoryAnswerCommentsRepository.create(makeAnswerComment({
            answerId: new UniqueEntityID("1"),
            authorId: student.id,
        }));
        await inMemoryAnswerCommentsRepository.create(makeAnswerComment({
            answerId: new UniqueEntityID("1"),
            authorId: student.id,
        }));
        await inMemoryAnswerCommentsRepository.create(makeAnswerComment({
            answerId: new UniqueEntityID("1"),
            authorId: student.id,
        }));

        const result = await sut.execute({ page: 1, answerId: "1" });
        
        expect(result.value?.comments).toHaveLength(3);
        expect(result.value?.comments[0].author).toBe('John Doe');
    });

    it("should fetch paginated answer comments", async () => {
        const student = makeStudent({ name: 'John Doe' });
        await inMemoryStudentsRepository.create(student);

        for (let i = 1; i <= 22; i++) {
            await inMemoryAnswerCommentsRepository.create(makeAnswerComment({
                answerId: new UniqueEntityID("1"),
                authorId: student.id,
            }));
        }

        const result = await sut.execute({ page: 2, answerId: "1" });
        
        expect(result.value?.comments).toHaveLength(2);
    });
});
