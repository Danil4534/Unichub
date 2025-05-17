import { ApiProperty } from '@nestjs/swagger';
import { TypeTask } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Homework 1',
    description: 'Title of the task',
  })
  title: string;

  @ApiProperty({
    example: 'Complete the first chapter exercises',
    description: 'Detailed description of the task',
  })
  description: string;

  @ApiProperty({
    enum: TypeTask,
    example: TypeTask.Default,
    description: 'Type of the task (e.g., Test or Default)',
  })
  type: TypeTask;

  @ApiProperty({
    example: '2025-04-10T08:00:00.000Z',
    description: 'Start time of the task (ISO 8601 format)',
    type: String,
    format: 'date-time',
  })
  startTime: Date | string;

  @ApiProperty({
    example: '2025-04-15T17:00:00.000Z',
    description: 'End time of the task (ISO 8601 format)',
    type: String,
    format: 'date-time',
  })
  endTime: Date | string;

  s;
}
