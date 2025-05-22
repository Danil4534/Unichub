import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma, Task } from '@prisma/client';
import { ApiBody } from '@nestjs/swagger';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiBody({ type: CreateTaskDto })
  async create(@Body() createTaskDto: Prisma.TaskCreateInput): Promise<Task> {
    return await this.taskService.createTask(createTaskDto);
  }

  @Get()
  async findAll(
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<Task[]> {
    try {
      const parsedData = await this.taskService.parseTypes(
        where,
        orderBy,
        skip,
        take,
      );
      return this.taskService.findAllTasks({
        where: parsedData.where,
        orderBy: parsedData.orderBy,
        skip: parsedData.skip,
        take: parsedData.take,
      });
    } catch (e) {
      throw new HttpException(
        'Invalid query parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.taskService.findOneTask(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.updateTask(id, updateTaskDto);
  }

  @Put('/updateStatusForTask/:taskId/:status')
  async updateStatusForTask(
    @Param('taskId') taskId: string,
    @Param('status') status: number,
  ) {
    return await this.taskService.updateStatusForTask(taskId, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.taskService.remove(id);
  }
}
