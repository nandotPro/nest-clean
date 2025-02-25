import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { GetQuestionBySlugUseCase } from "./get-question-by-slug";
import { makeQuestion } from "test/factories/make-question";
import { Slug } from "../../enterprise/entities/value-objects/slug";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { makeStudent } from "test/factories/make-student";
import { makeAttachment } from "test/factories/make-attachment";
import { makeQuestionAttachment } from "test/factories/make-question-attachments";

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: GetQuestionBySlugUseCase;

describe("GetQuestionBySlugUseCase", () => {
    beforeEach(() => {
        inMemoryQuestionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
        inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
        inMemoryStudentsRepository = new InMemoryStudentsRepository();
        inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
            inMemoryQuestionAttachmentsRepository,
            inMemoryStudentsRepository,
            inMemoryAttachmentsRepository
        );
        sut = new GetQuestionBySlugUseCase(inMemoryQuestionsRepository);
    });

    it("should be able to get a question by slug", async () => {
        const newStudent = makeStudent({
            name: "John Doe"
        });

        inMemoryStudentsRepository.students.push(newStudent);

        const newQuestion = makeQuestion({
            authorId: newStudent.id,
            slug: Slug.create("example-question"),
            title: "Example question",
            content: "Example content"
        });

        await inMemoryQuestionsRepository.create(newQuestion);

        const attachment = makeAttachment({
            title: "Some attachment"
        });

        inMemoryAttachmentsRepository.items.push(attachment);

        inMemoryQuestionAttachmentsRepository.attachments.push(
            makeQuestionAttachment({
                attachmentId: attachment.id,
                questionId: newQuestion.id
            })
        );

        const result = await sut.execute({
            slug: "example-question"
        });

        expect(result.isRight()).toBe(true);
        
        if (result.isRight()) {
            expect(result.value.question.title).toEqual("Example question");
            expect(result.value.question.content).toEqual("Example content");
            expect(result.value.question.slug).toEqual("example-question");
            expect(result.value.question.author).toEqual("John Doe");
            expect(result.value.question.attachments).toHaveLength(1);
            expect(result.value.question.attachments[0].title).toEqual("Some attachment");
        }
    });
});