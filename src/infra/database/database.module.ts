import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaAnswersRepository } from "./prisma/repositories/prisma-answers-repository";
import { PrismaAnswerCommentsRepository } from "./prisma/repositories/prisma-answer-comments-repository";
import { PrismaQuestionCommentsRepository } from "./prisma/repositories/prisma-question-comments-repository";
import { PrismaQuestionAttachmentsRepository } from "./prisma/repositories/prisma-question-attachments-repository";
import { PrismaQuestionsRepository } from "./prisma/repositories/prisma-questions-repository";
import { PrismaAnswerAttachmentsRepository } from "./prisma/repositories/prisma-answer-attachments-repository";

@Module({
    providers: [
        PrismaService, 
        PrismaAnswersRepository, 
        PrismaAnswerAttachmentsRepository, 
        PrismaAnswerCommentsRepository, 
        PrismaQuestionsRepository, 
        PrismaQuestionAttachmentsRepository, 
        PrismaQuestionCommentsRepository,
    ],
    exports: [
        PrismaService,
        PrismaAnswersRepository, 
        PrismaAnswerAttachmentsRepository, 
        PrismaAnswerCommentsRepository, 
        PrismaQuestionsRepository, 
        PrismaQuestionAttachmentsRepository, 
        PrismaQuestionCommentsRepository,
    ],
})
export class DatabaseModule {}
