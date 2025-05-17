import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskGradeDto } from './dto/create-task-grade.dto';
import { UpdateGradeDto } from './dto/update-task-grade.dto';

@Injectable()
export class TaskGradeService {
  constructor(private prisma: PrismaService) {}

  async assignGrade(dto: CreateTaskGradeDto) {
    const existing = await this.prisma.taskGrade.findFirst({
      where: { userId: dto.userId, taskId: dto.taskId },
    });
    if (existing) {
      throw new Error('Grade already exists for this user and subject.');
    }

    return this.prisma.taskGrade.create({
      data: {
        userId: dto.userId,
        taskId: dto.taskId,
        grade: dto.grade,
      },
    });
  }

  async updateGrade(id: string, dto: UpdateGradeDto) {
    const grade = await this.prisma.taskGrade.findUnique({
      where: { id },
    });
    if (!grade) throw new NotFoundException('Grade not found');

    return this.prisma.taskGrade.update({
      where: { id },
      data: { grade: dto.grade },
    });
  }

  async getGradesByUser(userId: string) {
    return this.prisma.taskGrade.findMany({
      where: { userId },
      include: { task: true },
    });
  }

  async getGradesByTask(taskId: string) {
    return this.prisma.taskGrade.findMany({
      where: { taskId },
      include: { user: true },
    });
  }
}
