import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import { InMemoryAnswerCommentsRepository } from "test/repositories/in-memory-answer-comments-repository";
import { CommentOnAnswerUseCase } from "./comment-on-answer";
import { makeAnswer } from "test/factories/make-answer";
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachment-repository";

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let sut: CommentOnAnswerUseCase;

describe("CommentOnAnswerUseCase", () => {
    beforeEach(() => {
        inMemoryAnswerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
        inMemoryAnswersRepository = new InMemoryAnswersRepository(inMemoryAnswerAttachmentsRepository);
        inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository();
        sut = new CommentOnAnswerUseCase(inMemoryAnswersRepository, inMemoryAnswerCommentsRepository);
    });

    it("should create a comment on an answer", async () => {
        const answer = makeAnswer();
        await inMemoryAnswersRepository.create(answer);

        const result = await sut.execute({
            authorId: "2",
            answerId: answer.id.toString(),
            content: "This is a comment"
        });

        expect(result.isRight()).toBe(true);
        expect(inMemoryAnswerCommentsRepository.comments[0].content).toEqual("This is a comment");
    });
});
