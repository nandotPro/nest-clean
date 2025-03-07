import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { InMemoryQuestionsCommentsRepository } from "test/repositories/in-memory-question-comments-repository";
import { CommentOnQuestionUseCase } from "./comment-on-question";
import { Question } from "../../enterprise/entities/question";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionsCommentsRepository: InMemoryQuestionsCommentsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: CommentOnQuestionUseCase;

describe("CommentOnQuestionUseCase", () => {
    beforeEach(() => {
        inMemoryQuestionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
        inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
        inMemoryStudentsRepository = new InMemoryStudentsRepository();
        inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
            inMemoryQuestionAttachmentsRepository,
            inMemoryStudentsRepository,
            inMemoryAttachmentsRepository
        );
        inMemoryQuestionsCommentsRepository = new InMemoryQuestionsCommentsRepository(inMemoryStudentsRepository);
        sut = new CommentOnQuestionUseCase(inMemoryQuestionsRepository, inMemoryQuestionsCommentsRepository);
    });

    it("should create a comment on a question", async () => {
        const question = Question.create({
            authorId: new UniqueEntityID("1"),
            title: "Sample Question",
            content: "This is a sample question content",
        });

        await inMemoryQuestionsRepository.create(question);

        const result = await sut.execute({
            authorId: "2",
            questionId: question.id.toString(),
            content: "This is a comment"
        });

        expect(result.isRight()).toBe(true);
        expect(inMemoryQuestionsCommentsRepository.comments[0].content).toEqual("This is a comment");
    });
});

