import { StudentFile } from './../../node_modules/.prisma/client/index.d';
import { StorageManagerService } from 'src/storage-manager/storage-manager.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private StorageManagerService: StorageManagerService,
  ) {}

  async createTask(
    createTaskDto: Prisma.TaskCreateInput,
    files: Express.Multer.File[],
  ) {
    try {
      const uploadedFiles = await Promise.all(
        files.map((file) =>
          this.StorageManagerService.uploadPublicFile(
            file.buffer,
            file.originalname,
          ),
        ),
      );

      const newTask = await this.prisma.task.create({
        data: {
          ...createTaskDto,
          status: 0,
        },
        include: {
          teacherFiles: true,
        },
      });

      return newTask;
    } catch (e) {
      console.error(e);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async uploadFileForTask(
    type: string,
    taskId: string,
    files: Express.Multer.File[],
  ) {
    try {
      const uploadedFiles = await Promise.all(
        files.map((file) =>
          this.StorageManagerService.uploadPublicFile(
            file.buffer,
            file.originalname,
          ),
        ),
      );
      if (type === 'teacher') {
        return await this.prisma.task.update({
          where: { id: taskId },
          data: {
            teacherFiles: {
              create: uploadedFiles.map((file, index) => ({
                url: file.Location,
                name: files[index].originalname,
                type: files[index].mimetype, // MIME тип
                size: files[index].size, // Размер в байтах
              })),
            },
          },
        });
      } else if (type === 'student') {
        return await this.prisma.task.update({
          where: { id: taskId },
          data: {
            studentFiles: {
              create: uploadedFiles.map((file, index) => ({
                url: file.Location,
                name: files[index].originalname,
                type: files[index].mimetype,
                size: files[index].size,
              })),
            },
          },
        });
      } else {
        throw new HttpException('Invalid type', HttpStatus.BAD_REQUEST);
      }
    } catch (e) {
      console.error(e);
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
      include: {
        teacherFiles: true,
        studentFiles: true,
      },
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
      const task = await this.prisma.task.findFirst({
        where: { id },
        include: { teacherFiles: true, studentFiles: true },
      });
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
      const removeItem = await this.prisma.task.delete({ where: { id } });
      return removeItem;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
}
