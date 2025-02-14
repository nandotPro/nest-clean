import { StudentsRepository } from "@/domain/forum/application/repositories/students-repository";
import { Student } from "@/domain/forum/enterprise/entities/student";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { PrismaStudentMapper } from "../mappers/prisma-student-mapper";

@Injectable()
export class PrismaStudentsRepository implements StudentsRepository {
    constructor(private prisma: PrismaService) {}
    
    async create(student: Student): Promise<void> {
        const data = PrismaStudentMapper.toPrisma(student);

        await this.prisma.user.create({
            data,
        });
    }
    async findByEmail(email: string): Promise<Student | null> {
        const student = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!student) {
            return null;
        }

        return PrismaStudentMapper.toDomain(student);
    }    
}