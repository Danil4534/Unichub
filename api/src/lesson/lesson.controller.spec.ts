import { Test, TestingModule } from '@nestjs/testing';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('LessonController', () => {
  let controller: LessonController;
  let service: LessonService;

  const mockLessonService = {
    create: jest.fn(),
    findAllLessons: jest.fn(),
    parseTypes: jest.fn(),
    findOneLesson: jest.fn(),
    updateLesson: jest.fn(),
    removeAllLessonIntoSubject: jest.fn(),
    updateStatusForLesson: jest.fn(),
    removeLesson: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonController],
      providers: [
        {
          provide: LessonService,
          useValue: mockLessonService,
        },
      ],
    }).compile();

    controller = module.get<LessonController>(LessonController);
    service = module.get<LessonService>(LessonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a lesson', async () => {
      const dto: Prisma.LessonCreateInput = { name: 'Math Lesson' } as any;
      const result = { id: '1', name: 'Math Lesson' };
      mockLessonService.create.mockResolvedValue(result);

      const response = await controller.create(dto, '1,2,3');
      expect(response).toEqual(result);
      expect(mockLessonService.create).toHaveBeenCalledWith(dto, [
        '1',
        '2',
        '3',
      ]);
    });
  });

  describe('findAllLessons', () => {
    it('should return all lessons', async () => {
      const parsed = {
        where: {},
        orderBy: {},
        skip: 0,
        take: 10,
      };
      const lessons = [{ id: '1', name: 'Lesson 1' }];
      mockLessonService.parseTypes.mockResolvedValue(parsed);
      mockLessonService.findAllLessons.mockResolvedValue(lessons);

      const result = await controller.findAllLessons();
      expect(result).toEqual(lessons);
    });

    it('should throw error on invalid query', async () => {
      mockLessonService.parseTypes.mockImplementation(() => {
        throw new Error('Invalid');
      });

      await expect(controller.findAllLessons()).rejects.toThrow(HttpException);
    });
  });

  describe('findOneLesson', () => {
    it('should return one lesson', async () => {
      const lesson = { id: '123', name: 'Test Lesson' };
      mockLessonService.findOneLesson.mockResolvedValue(lesson);

      const result = await controller.findOneLesson('123');
      expect(result).toEqual(lesson);
    });
  });

  describe('updateLesson', () => {
    it('should update the lesson', async () => {
      const dto: Prisma.LessonUpdateInput = { name: 'Updated' } as any;
      const updated = { id: '1', name: 'Updated' };
      mockLessonService.updateLesson.mockResolvedValue(updated);

      const result = await controller.updateLesson('1', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteAllLessonsIntoSubject', () => {
    it('should delete all lessons into subject', async () => {
      mockLessonService.removeAllLessonIntoSubject.mockResolvedValue('deleted');
      const result = await controller.deleteAllLessonsIntoSubject('sub1');
      expect(result).toBe('deleted');
    });
  });

  describe('updateStatusForLesson', () => {
    it('should update status for lesson', async () => {
      mockLessonService.updateStatusForLesson.mockResolvedValue(
        'status updated',
      );
      const result = await controller.updateStatusForLesson('lesson1', 1);
      expect(result).toBe('status updated');
    });
  });

  describe('remove', () => {
    it('should remove a lesson', async () => {
      mockLessonService.removeLesson.mockResolvedValue('removed');
      const result = await controller.remove('1');
      expect(result).toBe('removed');
    });
  });
});
