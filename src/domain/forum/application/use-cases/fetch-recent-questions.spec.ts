import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { FetchRecentQuestionsUseCase } from "./fetch-recent-questions";
import { makeQuestion } from "test/factories/make-question";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: FetchRecentQuestionsUseCase;

describe("FetchRecentQuestionsUseCase", () => {
    beforeEach(() => {
        inMemoryQuestionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
        inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
        inMemoryStudentsRepository = new InMemoryStudentsRepository();
        inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
            inMemoryQuestionAttachmentsRepository,
            inMemoryStudentsRepository,
            inMemoryAttachmentsRepository
        );
        sut = new FetchRecentQuestionsUseCase(inMemoryQuestionsRepository);
    });

    it("should fetch recent questions", async () => {
        const currentYear = new Date().getFullYear();

        await inMemoryQuestionsRepository.create(makeQuestion({
            createdAt: new Date(currentYear, 0, 20),
        }));

        await inMemoryQuestionsRepository.create(makeQuestion({
            createdAt: new Date(currentYear, 0, 18),
        }));

        await inMemoryQuestionsRepository.create(makeQuestion({
            createdAt: new Date(currentYear, 0, 23),
        }));

        const result = await sut.execute({ page: 1 });
        
        expect(result.value?.questions[0].createdAt).toEqual(new Date(currentYear, 0, 23));
        expect(result.value?.questions[1].createdAt).toEqual(new Date(currentYear, 0, 20));
        expect(result.value?.questions[2].createdAt).toEqual(new Date(currentYear, 0, 18));
    });

    it("should fetch paginated recent questions", async () => {
        for (let i = 1; i <= 22; i++) {
            await inMemoryQuestionsRepository.create(makeQuestion());
        }

        const result = await sut.execute({ page: 2 });
        
        expect(result.value?.questions).toHaveLength(2);
    }); 
});
