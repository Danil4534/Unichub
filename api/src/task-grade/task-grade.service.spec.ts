import { Test, TestingModule } from '@nestjs/testing';
import { TaskGradeService } from './task-grade.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TaskGradeService', () => {
  let service: TaskGradeService;
  let prisma: PrismaService;

  const mockPrisma = {
    taskGrade: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskGradeService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TaskGradeService>(TaskGradeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assignGrade', () => {
    it('should throw an error if grade already exists', async () => {
      mockPrisma.taskGrade.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.assignGrade({ userId: 'u1', taskId: 't1', grade: 90 }),
      ).rejects.toThrow('Grade already exists for this user and subject.');

      expect(mockPrisma.taskGrade.findFirst).toHaveBeenCalledWith({
        where: { userId: 'u1', taskId: 't1' },
      });
    });

    it('should create a new grade if not existing', async () => {
      const dto = { userId: 'u1', taskId: 't1', grade: 90 };
      const created = { id: '1', ...dto };

      mockPrisma.taskGrade.findFirst.mockResolvedValue(null);
      mockPrisma.taskGrade.create.mockResolvedValue(created);

      const result = await service.assignGrade(dto);

      expect(result).toEqual(created);
      expect(mockPrisma.taskGrade.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('updateGrade', () => {
    it('should throw NotFoundException if grade does not exist', async () => {
      mockPrisma.taskGrade.findUnique.mockResolvedValue(null);

      await expect(
        service.updateGrade('grade1', { grade: 75 }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.taskGrade.findUnique).toHaveBeenCalledWith({
        where: { id: 'grade1' },
      });
    });

    it('should update and return grade if it exists', async () => {
      const existing = { id: 'grade1', grade: 70 };
      const updated = { id: 'grade1', grade: 80 };

      mockPrisma.taskGrade.findUnique.mockResolvedValue(existing);
      mockPrisma.taskGrade.update.mockResolvedValue(updated);

      const result = await service.updateGrade('grade1', { grade: 80 });

      expect(result).toEqual(updated);
      expect(mockPrisma.taskGrade.update).toHaveBeenCalledWith({
        where: { id: 'grade1' },
        data: { grade: 80 },
      });
    });
  });

  describe('getGradesByUser', () => {
    it('should return all grades for a user', async () => {
      const userId = 'user123';
      const grades = [{ id: '1', grade: 90 }];

      mockPrisma.taskGrade.findMany.mockResolvedValue(grades);

      const result = await service.getGradesByUser(userId);

      expect(result).toEqual(grades);
      expect(mockPrisma.taskGrade.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { task: true },
      });
    });
  });

  describe('getGradesByTask', () => {
    it('should return all grades for a task', async () => {
      const taskId = 'task123';
      const grades = [{ id: '1', grade: 85 }];

      mockPrisma.taskGrade.findMany.mockResolvedValue(grades);

      const result = await service.getGradesByTask(taskId);

      expect(result).toEqual(grades);
      expect(mockPrisma.taskGrade.findMany).toHaveBeenCalledWith({
        where: { taskId },
        include: { user: true },
      });
    });
  });
});
