import { InMemoryQuestionsCommentsRepository } from "test/repositories/in-memory-question-comments-repository";
import { FetchQuestionCommentsUseCase } from "./fetch-question-comments";
import { makeQuestionComment } from "test/factories/make-question-comment";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { makeStudent } from "test/factories/make-student";

let inMemoryQuestionCommentsRepository: InMemoryQuestionsCommentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: FetchQuestionCommentsUseCase;

describe("FetchQuestionCommentsUseCase", () => {
    beforeEach(() => {
        inMemoryStudentsRepository = new InMemoryStudentsRepository();
        inMemoryQuestionCommentsRepository = new InMemoryQuestionsCommentsRepository(inMemoryStudentsRepository);
        sut = new FetchQuestionCommentsUseCase(inMemoryQuestionCommentsRepository);
    });

    it("should fetch question comments", async () => {
        const student = makeStudent({ name: "John Doe" });

        inMemoryStudentsRepository.students.push(student);

        await inMemoryQuestionCommentsRepository.create(makeQuestionComment({
            questionId: new UniqueEntityID("1"),
            authorId: student.id,
        }));

        await inMemoryQuestionCommentsRepository.create(makeQuestionComment({
            questionId: new UniqueEntityID("1"),
            authorId: student.id,
        }));

        await inMemoryQuestionCommentsRepository.create(makeQuestionComment({
            questionId: new UniqueEntityID("1"),
            authorId: student.id,
        }));

        const result = await sut.execute({ page: 1, questionId: "1" });
        
        expect(result.value?.comments).toHaveLength(3);
        expect(result.value?.comments[0].author).toBe(student.name);
        expect(result.value?.comments[1].author).toBe(student.name);
        expect(result.value?.comments[2].author).toBe(student.name);


    });

    it("should fetch paginated question comments", async () => {
        const student = makeStudent({ name: "John Doe" });

        inMemoryStudentsRepository.students.push(student);

        for (let i = 1; i <= 22; i++) {
            await inMemoryQuestionCommentsRepository.create(makeQuestionComment({
                questionId: new UniqueEntityID("1"),
                authorId: student.id,
            }));
        }

        const result = await sut.execute({ page: 2, questionId: "1" });
        
        expect(result.value?.comments).toHaveLength(2);
        expect(result.value?.comments[0].author).toBe(student.name);
        expect(result.value?.comments[1].author).toBe(student.name);
    });
});
