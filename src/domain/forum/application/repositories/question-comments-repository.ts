import { QuestionComment } from "../../enterprise/entities/question-comment";
import { PaginationParams } from "@/core/repositories/pagination-params";

export abstract class QuestionCommentsRepository {
    abstract create(questionComment: QuestionComment): Promise<void>;
    abstract findById(id: string): Promise<QuestionComment | null>;
    abstract findManyByQuestionId(questionId: string, params: PaginationParams): Promise<QuestionComment[]>;
    abstract delete(questionComment: QuestionComment): Promise<void>;
}
