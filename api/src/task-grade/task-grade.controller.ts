import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaskGradeService } from './task-grade.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateTaskGradeDto } from './dto/create-task-grade.dto';

@Controller('task-grade')
export class TaskGradeController {
  constructor(private readonly taskGradeService: TaskGradeService) {}
  @Post()
  @ApiOperation({ summary: 'Assign a grade to a task' })
  assign(@Body() dto: CreateTaskGradeDto) {
    return this.taskGradeService.assignGrade(dto);
  }
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all task grades for a user' })
  getByUser(@Param('userId') userId: string) {
    return this.taskGradeService.getGradesByUser(userId);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get all grades for a task' })
  getByTask(@Param('taskId') taskId: string) {
    return this.taskGradeService.getGradesByTask(taskId);
  }
}
