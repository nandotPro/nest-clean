import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaAnswersRepository } from "./prisma/repositories/prisma-answers-repository";
import { PrismaAnswerCommentsRepository } from "./prisma/repositories/prisma-answer-comments-repository";
import { PrismaQuestionCommentsRepository } from "./prisma/repositories/prisma-question-comments-repository";
import { PrismaQuestionAttachmentsRepository } from "./prisma/repositories/prisma-question-attachments-repository";
import { PrismaQuestionsRepository } from "./prisma/repositories/prisma-questions-repository";
import { PrismaAnswerAttachmentsRepository } from "./prisma/repositories/prisma-answer-attachments-repository";
import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";
import { StudentsRepository } from "@/domain/forum/application/repositories/students-repository";
import { PrismaStudentsRepository } from "./prisma/repositories/prisma-students-repository";
@Module({
    providers: [
        PrismaService, 
        {
            provide: QuestionsRepository,
            useClass: PrismaQuestionsRepository,
        },
        {
            provide: StudentsRepository,
            useClass: PrismaStudentsRepository,
        },
        PrismaAnswersRepository, 
        PrismaAnswerAttachmentsRepository, 
        PrismaAnswerCommentsRepository,  
        PrismaQuestionAttachmentsRepository, 
        PrismaQuestionCommentsRepository,
    ],
    exports: [
        QuestionsRepository, 
        StudentsRepository,
        PrismaService,
        PrismaAnswersRepository, 
        PrismaAnswerAttachmentsRepository, 
        PrismaAnswerCommentsRepository, 
        PrismaQuestionAttachmentsRepository, 
        PrismaQuestionCommentsRepository,
    ],
})
export class DatabaseModule {}
