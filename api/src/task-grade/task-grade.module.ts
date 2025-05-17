import { Module } from '@nestjs/common';
import { TaskGradeService } from './task-grade.service';
import { TaskGradeController } from './task-grade.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TaskGradeController],
  providers: [TaskGradeService, PrismaService],
})
export class TaskGradeModule {}
