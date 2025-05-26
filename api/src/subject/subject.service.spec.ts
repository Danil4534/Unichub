import { Test, TestingModule } from '@nestjs/testing';
import { SubjectService } from './subject.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Subject } from '@prisma/client';
import { HttpException } from '@nestjs/common';

describe('SubjectService', () => {
  let service: SubjectService;
  let prisma: PrismaService;

  const mockSubject: Subject = {
    id: 'subj1',
    name: 'Math',
    description: 'Mathematics subject',
    status: 'active', // add fields present in your schema
    userId: 'user1', // add fields present in your schema
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        {
          provide: PrismaService,
          useValue: {
            subject: {
              findFirst: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SubjectService>(SubjectService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new subject if it does not exist', async () => {
      (prisma.subject.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.subject.create as jest.Mock).mockResolvedValue(mockSubject);

      const createDto: Prisma.SubjectCreateInput = {
        name: 'Math',
        description: 'Mathematics subject',
      };

      const result = await service.create(createDto);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(prisma.subject.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toEqual(mockSubject);
    });

    it('should throw HttpException if subject name already exists', async () => {
      (prisma.subject.findFirst as jest.Mock).mockResolvedValue(mockSubject);

      const createDto: Prisma.SubjectCreateInput = {
        name: 'Math',
        description: 'Mathematics subject',
      };

      await expect(service.create(createDto)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException on other errors', async () => {
      (prisma.subject.findFirst as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      const createDto: Prisma.SubjectCreateInput = {
        name: 'Math',
        description: 'Mathematics subject',
      };

      await expect(service.create(createDto)).rejects.toThrow(HttpException);
    });
  });

  describe('findAllSubjects', () => {
    it('should call prisma findMany with correct params', async () => {
      const params = service.parseTypes(
        '{"name":{"contains":"Math"}}',
        '{"name":"asc"}',
        '5',
        '10',
      );
      (prisma.subject.findMany as jest.Mock).mockResolvedValue([mockSubject]);

      const result = await service.findAllSubjects(params);

      expect(prisma.subject.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: params.where,
        orderBy: params.orderBy,
        include: {
          lessons: true,
          tasks: true,
          groups: { include: { students: true } },
        },
      });
      expect(result).toEqual([mockSubject]);
    });
  });

  describe('findOneSubject', () => {
    it('should return the subject when found', async () => {
      (prisma.subject.findFirst as jest.Mock).mockResolvedValue(mockSubject);

      const result = await service.findOneSubject('subj1');

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: 'subj1' },
        include: { tasks: true, lessons: true, groups: true },
      });
      expect(result).toEqual(mockSubject);
    });

    it('should throw HttpException on error', async () => {
      (prisma.subject.findFirst as jest.Mock).mockRejectedValue(
        new Error('fail'),
      );

      await expect(service.findOneSubject('subj1')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateSubject', () => {
    it('should update the subject', async () => {
      const updateDto: Prisma.SubjectUpdateInput = {
        description: 'Updated description',
      };
      (prisma.subject.update as jest.Mock).mockResolvedValue({
        ...mockSubject,
        ...updateDto,
      });

      const result = await service.updateSubject('subj1', updateDto);

      expect(prisma.subject.update).toHaveBeenCalledWith({
        where: { id: 'subj1' },
        data: updateDto,
      });
      expect(result.description).toBe('Updated description');
    });

    it('should handle error gracefully', async () => {
      (prisma.subject.update as jest.Mock).mockRejectedValue(new Error('fail'));

      const updateDto: Prisma.SubjectUpdateInput = {
        description: 'Updated description',
      };

      await expect(
        service.updateSubject('subj1', updateDto),
      ).resolves.toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete the subject if found', async () => {
      (prisma.subject.findFirst as jest.Mock).mockResolvedValue(mockSubject);
      (prisma.subject.delete as jest.Mock).mockResolvedValue(mockSubject);

      await service.remove('subj1');

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: 'subj1' },
      });
      expect(prisma.subject.delete).toHaveBeenCalledWith({
        where: { id: 'subj1' },
      });
    });

    it('should not delete if subject not found', async () => {
      (prisma.subject.findFirst as jest.Mock).mockResolvedValue(null);

      await service.remove('subj1');

      expect(prisma.subject.delete).not.toHaveBeenCalled();
    });

    it('should throw HttpException on error', async () => {
      (prisma.subject.findFirst as jest.Mock).mockRejectedValue(
        new Error('fail'),
      );

      await expect(service.remove('subj1')).rejects.toThrow(HttpException);
    });
  });

  describe('parseTypes', () => {
    it('should parse query params correctly', () => {
      const where = '{"name":{"contains":"Math"}}';
      const orderBy = '{"name":"asc"}';
      const skip = '5';
      const take = '10';

      const result = service.parseTypes(where, orderBy, skip, take);

      expect(result).toEqual({
        where: { name: { contains: 'Math' } },
        orderBy: { name: 'asc' },
        skip: 5,
        take: 10,
      });
    });

    it('should return defaults when params are missing', () => {
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
});
