import { Answer, AnswerProps } from "@/domain/forum/enterprise/entities/answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { faker } from "@faker-js/faker";

export function makeAnswer(
    override: Partial<AnswerProps> = {},
    id?: UniqueEntityID,
) {
    const answer = Answer.create({
        authorId: new UniqueEntityID("1"),
        questionId: new UniqueEntityID("1"),
        content: faker.lorem.text(),
        ...override
    }, id);

    return answer;
}