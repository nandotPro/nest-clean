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
            slug: Slug.create("example-question")
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

        expect(result.value).toMatchObject({
            question: expect.objectContaining({
                title: newQuestion.title,
                author: expect.any(String),
                attachments: [
                    expect.objectContaining({
                        title: attachment.title
                    })
                ]
            }),
        });
    });
});