import { Test, TestingModule } from '@nestjs/testing';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';
import { Prisma, Subject } from '@prisma/client';
import { HttpException } from '@nestjs/common';

describe('SubjectController', () => {
  let controller: SubjectController;
  let service: SubjectService;

  const mockSubject: Subject = {
    id: 'subj1',
    name: 'Math',
    description: 'Mathematics subject',
    userId: '',
    status: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectController],
      providers: [
        {
          provide: SubjectService,
          useValue: {
            create: jest.fn(),
            parseTypes: jest.fn(),
            findAllSubjects: jest.fn(),
            findOneSubject: jest.fn(),
            updateSubject: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubjectController>(SubjectController);
    service = module.get<SubjectService>(SubjectService);
  });

  describe('createSubject', () => {
    it('should create a subject', async () => {
      const createDto: Prisma.SubjectCreateInput = {
        name: 'Math',
        description: 'Mathematics subject',
      };
      (service.create as jest.Mock).mockResolvedValue(mockSubject);

      const result = await controller.createSubject(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockSubject);
    });
  });

  describe('findAllSubjects', () => {
    it('should parse query params and return subjects', async () => {
      const query = {
        where: '{"name": {"contains": "Math"}}',
        orderBy: '{"name": "asc"}',
        skip: '0',
        take: '10',
      };

      const parsedData = {
        where: { name: { contains: 'Math' } },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10,
      };

      (service.parseTypes as jest.Mock).mockResolvedValue(parsedData);
      (service.findAllSubjects as jest.Mock).mockResolvedValue([mockSubject]);

      const result = await controller.findAllSubjects(
        query.where,
        query.orderBy,
        query.skip,
        query.take,
      );

      expect(service.parseTypes).toHaveBeenCalledWith(
        query.where,
        query.orderBy,
        query.skip,
        query.take,
      );
      expect(service.findAllSubjects).toHaveBeenCalledWith(parsedData);
      expect(result).toEqual([mockSubject]);
    });

    it('should throw HttpException on parseTypes error', async () => {
      (service.parseTypes as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(
        controller.findAllSubjects('bad', 'bad', 'bad', 'bad'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a subject by id', async () => {
      (service.findOneSubject as jest.Mock).mockResolvedValue(mockSubject);

      const result = await controller.findOne('subj1');

      expect(service.findOneSubject).toHaveBeenCalledWith('subj1');
      expect(result).toEqual(mockSubject);
    });
  });

  describe('updateSubject', () => {
    it('should update a subject', async () => {
      const updateDto: Prisma.SubjectUpdateInput = {
        description: 'Updated description',
      };
      (service.updateSubject as jest.Mock).mockResolvedValue({
        ...mockSubject,
        ...updateDto,
      });

      const result = await controller.updateSubject('subj1', updateDto);

      expect(service.updateSubject).toHaveBeenCalledWith('subj1', updateDto);
      expect(result.description).toEqual('Updated description');
    });
  });

  describe('remove', () => {
    it('should call remove service', async () => {
      (service.remove as jest.Mock).mockResolvedValue({ id: 'subj1' });

      const result = await controller.remove('subj1');

      expect(service.remove).toHaveBeenCalledWith('subj1');
      expect(result).toEqual({ id: 'subj1' });
    });
  });
});
