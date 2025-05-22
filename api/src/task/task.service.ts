import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(createTaskDto: Prisma.TaskCreateInput) {
    try {
      const newTask = await this.prisma.task.create({
        data: {
          ...createTaskDto,
          status: 0,
        },
      });
      return newTask;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStatusForTask(taskId: string, status: number) {
    return await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: +status,
      },
    });
  }

  async findAllTasks(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.task.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }
  parseTypes(where, orderBy, skip, take) {
    let parsedWhere: Prisma.TaskWhereInput | undefined;
    let parsedOrderBy: Prisma.TaskOrderByWithRelationInput | undefined;
    let parsedSkip: number | undefined;
    let parsedTake: number | undefined;

    parsedWhere = where ? JSON.parse(where) : undefined;
    parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    parsedSkip = skip ? parseInt(skip, 10) : 0;
    parsedTake = take ? parseInt(take, 10) : undefined;

    let parsedData = {
      where: parsedWhere,
      orderBy: parsedOrderBy,
      skip: parsedSkip,
      take: parsedTake,
    };

    return parsedData;
  }
  async findOneTask(id: string): Promise<Task> {
    try {
      const task = await this.prisma.task.findFirst({ where: { id } });
      return task;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
  async updateTask(id: string, updateTaskDto: Prisma.TaskUpdateInput) {
    try {
      const updateTask = await this.prisma.task.update({
        where: { id },
        data: updateTaskDto,
      });
      return updateTask;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string) {
    try {
      const deleteTask = await this.prisma.task.findFirst({
        where: { id },
      });
      if (deleteTask) {
        await this.prisma.task.delete({ where: { id } });
      }
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
}
