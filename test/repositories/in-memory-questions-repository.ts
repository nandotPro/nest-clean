import { PaginationParams } from "@/core/repositories/pagination-params";
import { QuestionsRepository } from "../../src/domain/forum/application/repositories/questions-repository";
import { Question } from "../../src/domain/forum/enterprise/entities/question";
import { DomainEvents } from "@/core/events/domain-events";
import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question.details";
import { InMemoryStudentsRepository } from "./in-memory-students-repository";
import { InMemoryAttachmentsRepository } from "./in-memory-attachments-repository";
import { InMemoryQuestionAttachmentsRepository } from "./in-memory-question-attachments-repository";

export class InMemoryQuestionsRepository implements QuestionsRepository {
    public questions: Question[] = [];

    constructor(
        private questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository,
        private studentsRepository: InMemoryStudentsRepository,
        private attachmentsRepository: InMemoryAttachmentsRepository,
    ) {}

    async create(question: Question): Promise<void> {
        this.questions.push(question);

        await this.questionAttachmentsRepository.createMany(question.attachments.getItems());

        DomainEvents.dispatchEventsForAggregate(question.id)

    }

    async findBySlug(slug: string): Promise<Question | null> {
        const question = this.questions.find(question => question.slug.value === slug);

        if (!question) {
            return null;
        }

        return question;
    }

    async findDetailsBySlug(slug: string): Promise<QuestionDetails | null> {
        const question = this.questions.find(question => question.slug.value === slug);

        if (!question) {
            return null;
        }

        const author = this.studentsRepository.students.find(student => student.id.equals(question.authorId));

        if (!author) {
            throw new Error(`Author with ID ${question.authorId.toString()} not found`);
        }

        const questionAttachments = this.questionAttachmentsRepository.attachments.filter(
            attachment => attachment.questionId.equals(question.id)
        );

        const attachments = questionAttachments.map(questionAttachment => {
            const file = this.attachmentsRepository.items.find(file => 
                file.id.equals(questionAttachment.attachmentId)
            );

            if (!file) {
                throw new Error(`Attachment with ID ${questionAttachment.attachmentId.toString()} not found`);
            }

            return file;
        });

        return QuestionDetails.create({
            questionId: question.id,
            authorId: question.authorId,
            author: author.name,
            title: question.title,
            slug: question.slug.value,
            content: question.content,
            bestAnswerId: question.bestAnswerId ?? null,
            attachments,
            createdAt: question.createdAt,
            updatedAt: question.updatedAt,
        });
    }

    async findById(id: string): Promise<Question | null> {
        const question = this.questions.find(question => question.id.toString() === id);

        if (!question) {
            return null;
        }

        return question;
    }

    async save(question: Question): Promise<void> {
        const questionIndex = this.questions.findIndex((q) => q.id === question.id);

        if (questionIndex === -1) {
            return;
        }

        this.questions[questionIndex] = question;

        await this.questionAttachmentsRepository.createMany(question.attachments.getItems());
        
        await this.questionAttachmentsRepository.deleteMany(question.attachments.getItems());

        DomainEvents.dispatchEventsForAggregate(question.id)

    }
    
    async delete(question: Question): Promise<void> {
        const questionIndex = this.questions.findIndex((q) => q.id === question.id);

        if (questionIndex === -1) {
            return;
        }

        this.questions.splice(questionIndex, 1);

        this.questionAttachmentsRepository.deleteManyByQuestionId(question.id.toString());
    }

    async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
        const questions = this.questions
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice((page - 1) * 20, page * 20);

        return questions;
    }

    findAll(): Question[] {
        return this.questions;
    }
}