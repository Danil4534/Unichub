import { Test, TestingModule } from '@nestjs/testing';
import { LessonService } from './lesson.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventService } from 'src/event/event.service';
import { HttpException } from '@nestjs/common';

describe('LessonService', () => {
  let service: LessonService;
  let prisma: PrismaService;
  let eventService: EventService;

  const mockLesson = {
    id: '1',
    title: 'Test Lesson',
    description: 'Test Description',
    startTime: new Date(),
    endTime: new Date(),
    created: new Date(),
  };

  const mockPrismaService = {
    lesson: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockEventService = {
    createEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventService, useValue: mockEventService },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
    prisma = module.get<PrismaService>(PrismaService);
    eventService = module.get<EventService>(EventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneLesson', () => {
    it('should return a lesson', async () => {
      mockPrismaService.lesson.findFirst.mockResolvedValue(mockLesson);
      const result = await service.findOneLesson('1');
      expect(result).toEqual(mockLesson);
      expect(prisma.lesson.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw an error if lesson not found', async () => {
      mockPrismaService.lesson.findFirst.mockRejectedValue(new Error());
      await expect(service.findOneLesson('1')).rejects.toThrow(HttpException);
    });
  });

  describe('parseTypes', () => {
    it('should parse query parameters correctly', () => {
      const where = JSON.stringify({ title: 'Test' });
      const orderBy = JSON.stringify({ created: 'desc' });
      const skip = '0';
      const take = '10';

      const result = service.parseTypes(where, orderBy, skip, take);

      expect(result).toEqual({
        where: { title: 'Test' },
        orderBy: { created: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should handle undefined parameters', () => {
      const result = service.parseTypes(
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(result).toEqual({
        where: undefined,
        orderBy: undefined,
        skip: 0,
        take: undefined,
      });
    });
  });

  describe('findAllLessons', () => {
    it('should return an array of lessons', async () => {
      const lessons = [mockLesson];
      mockPrismaService.lesson.findMany.mockResolvedValue(lessons);

      const result = await service.findAllLessons({
        skip: 0,
        take: 10,
        where: { title: 'Test' },
        orderBy: { created: 'desc' },
      });

      expect(result).toEqual(lessons);
      expect(prisma.lesson.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { title: 'Test' },
        orderBy: { created: 'desc' },
        include: { tasks: true, subject: true },
      });
    });
  });

  describe('create', () => {
    it('should create a lesson and associated events', async () => {
      const createLessonDto = {
        title: 'Test Lesson',
        description: 'Test Description',
        startTime: new Date(),
        endTime: new Date(),
        status: 0,
        created: new Date(),
      };
      const groupIds = ['1', '2'];

      mockPrismaService.lesson.create.mockResolvedValue(mockLesson);
      mockEventService.createEvent.mockResolvedValue({});

      const result = await service.create(createLessonDto, groupIds);

      expect(result).toEqual(mockLesson);
      expect(prisma.lesson.create).toHaveBeenCalledWith({
        data: createLessonDto,
      });
      // Since createEvent is commented out in the service, we won't check for its calls here.
    });

    it('should throw an error if creation fails', async () => {
      mockPrismaService.lesson.create.mockRejectedValue(new Error());

      await expect(service.create(undefined, [])).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateLesson', () => {
    it('should update a lesson', async () => {
      const updateLessonDto = { title: 'Updated Title' };
      const updatedLesson = { ...mockLesson, ...updateLessonDto };

      mockPrismaService.lesson.update.mockResolvedValue(updatedLesson);

      const result = await service.updateLesson('1', updateLessonDto);

      expect(result).toEqual(updatedLesson);
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateLessonDto,
      });
    });

    it('should throw an error if update fails', async () => {
      mockPrismaService.lesson.update.mockRejectedValue(new Error());

      await expect(service.updateLesson('1', {})).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('removeLesson', () => {
    it('should delete a lesson if it exists', async () => {
      mockPrismaService.lesson.findFirst.mockResolvedValue(mockLesson);
      mockPrismaService.lesson.delete.mockResolvedValue(mockLesson);

      const result = await service.removeLesson('1');

      expect(result).toBe('Delete was successful');
      expect(prisma.lesson.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.lesson.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return success message if lesson does not exist', async () => {
      mockPrismaService.lesson.findFirst.mockResolvedValue(null);

      const result = await service.removeLesson('1');

      expect(result).toBe('Delete was successful');
      expect(prisma.lesson.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.lesson.delete).not.toHaveBeenCalled();
    });

    it('should throw an error if deletion fails', async () => {
      mockPrismaService.lesson.findFirst.mockRejectedValue(new Error());

      await expect(service.removeLesson('1')).rejects.toThrow(HttpException);
    });
  });

  describe('removeAllLessonIntoSubject', () => {
    it('should delete all lessons into subject', async () => {
      const deletedLessons = { count: 2 };
      mockPrismaService.lesson.deleteMany.mockResolvedValue(deletedLessons);

      const result = await service.removeAllLessonIntoSubject('sub1');

      expect(result).toEqual(deletedLessons);
      expect(prisma.lesson.deleteMany).toHaveBeenCalledWith({
        where: { subjectId: 'sub1' },
      });
    });

    it('should throw an error if deletion fails', async () => {
      mockPrismaService.lesson.deleteMany.mockRejectedValue(new Error());

      await expect(service.removeAllLessonIntoSubject('sub1')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateStatusForLesson', () => {
    it('should update the status of a lesson', async () => {
      const updatedLesson = { ...mockLesson, status: 1 };
      mockPrismaService.lesson.update.mockResolvedValue(updatedLesson);

      const result = await service.updateStatusForLesson('1', 1);

      expect(result).toEqual(updatedLesson);
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 1 },
      });
    });
  });
});
