import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';
import { TypeTask } from '@prisma/client';

describe('TaskService', () => {
  let service: TaskService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a task', async () => {
      const taskInput = {
        status: 0,
        grade: 5,
        description: 'desc',
        title: 'title',
        type: TypeTask.Default,
        startTime: new Date(),
        endTime: new Date(),
        lessonId: 'lesson1',
        subjectId: 'subject1',
      };

      const createdTask = { id: '1', ...taskInput };

      (prisma.task.create as jest.Mock).mockResolvedValue(createdTask);

      const result = await service.createTask(taskInput);

      expect(prisma.task.create).toHaveBeenCalledWith({ data: taskInput });
      expect(result).toEqual(createdTask);
    });

    it('should throw error if create fails', async () => {
      (prisma.task.create as jest.Mock).mockRejectedValue(
        new Error('Failed to create'),
      );

      await expect(service.createTask({} as any)).rejects.toThrow(
        'Failed to create',
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateId = '1';
      const updateData = { status: 1 };

      const updatedTask = {
        id: updateId,
        status: 1,
        grade: 5,
        description: 'desc',
        title: 'title',
        type: TypeTask.Default,
        startTime: new Date(),
        endTime: new Date(),
        lessonId: 'lesson1',
        subjectId: 'subject1',
      };

      (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);

      const result = await service.updateTask(updateId, updateData);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: updateId },
        data: updateData,
      });

      expect(result).toEqual(updatedTask);
    });
  });

  describe('findOne', () => {
    it('should find one task by id', async () => {
      const task = {
        id: '1',
        status: 0,
        grade: 5,
        description: 'desc',
        title: 'title',
        type: TypeTask.Default,
        startTime: new Date(),
        endTime: new Date(),
        lessonId: 'lesson1',
        subjectId: 'subject1',
      };

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(task);

      const result = await service.findOneTask('1');

      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(result).toEqual(task);
    });
  });

  describe('remove', () => {
    it('should delete a task by id', async () => {
      const task = {
        id: '1',
        status: 0,
        grade: 5,
        description: 'desc',
        title: 'title',
        type: TypeTask.Default,
        startTime: new Date(),
        endTime: new Date(),
        lessonId: 'lesson1',
        subjectId: 'subject1',
      };

      (prisma.task.delete as jest.Mock).mockResolvedValue(task);

      const result = await service.remove('1');

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(result).toEqual(task);
    });
  });
});
