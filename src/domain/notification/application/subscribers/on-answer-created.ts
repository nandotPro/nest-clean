import { DomainEvents } from "@/core/events/domain-events";
import { EventHandler } from "@/core/events/event-handler";
import { AnswerCreatedEvent } from "@/domain/forum/enterprise/events/answer-created-event";
import { QuestionsRepository } from './../../../forum/application/repositories/questions-repository';
import { SendNotificationUseCase } from './../use-cases/send-notification';

export class OnAnswerCreated implements EventHandler {
    constructor(
        private questionsRepository: QuestionsRepository,
        private sendNotification: SendNotificationUseCase
    ) {
        this.setupSubscriptions()
    }

    setupSubscriptions(): void {
        DomainEvents.register(this.sendNewAnswerNotification.bind(this), 
            AnswerCreatedEvent.name
        )
    }
    
    private async sendNewAnswerNotification({ answer }: AnswerCreatedEvent) {
        const question = await this.questionsRepository.findById(answer.questionId.toString())

        if (question) {
            await this.sendNotification.execute({
                recipientId: question?.authorId.toString(),
                title: `Nova Resposta em "${question.title
                    .substring(0, 40)
                    .concat('...')}"`,
                content: answer.excerpt
            })
        }

        
    }
}