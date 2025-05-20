import { Test, TestingModule } from '@nestjs/testing';
import { GradeBookController } from './grade-book.controller';
import { GradeBookService } from './grade-book.service';
import { Response } from 'express';

describe('GradeBookController', () => {
  let controller: GradeBookController;
  let service: GradeBookService;

  const mockGradeBookService = {
    getAllSubjectGradesWithTasks: jest.fn(),
    exportGroupedRatingsToExcel: jest.fn(),
    exportGroupRatingToExcel: jest.fn(),
    getGroupRatingData: jest.fn(),
    exportGroupRatingToPdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradeBookController],
      providers: [
        {
          provide: GradeBookService,
          useValue: mockGradeBookService,
        },
      ],
    }).compile();

    controller = module.get<GradeBookController>(GradeBookController);
    service = module.get<GradeBookService>(GradeBookService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserSubjectsWithTaskGrades', () => {
    it('should return subjects with task grades', async () => {
      const userId = '123';
      const mockData = [{ subject: 'Math', grade: 'A' }];
      mockGradeBookService.getAllSubjectGradesWithTasks.mockResolvedValue(
        mockData,
      );

      const result = await controller.getUserSubjectsWithTaskGrades(userId);
      expect(result).toEqual(mockData);
      expect(service.getAllSubjectGradesWithTasks).toHaveBeenCalledWith(userId);
    });
  });

  describe('exportGroupedRatings', () => {
    it('should call service method with response object', async () => {
      const res = {} as Response;
      await controller.exportGroupedRatings(res);
      expect(service.exportGroupedRatingsToExcel).toHaveBeenCalledWith(res);
    });
  });

  describe('exportGroupRating', () => {
    it('should call service with id and response', async () => {
      const res = {} as Response;
      const id = 'group1';
      await controller.exportGroupRating(id, res);
      expect(service.exportGroupRatingToExcel).toHaveBeenCalledWith(id, res);
    });
  });

  describe('getGroupRating', () => {
    it('should return group rating data', async () => {
      const id = 'group1';
      const mockData = { group: 'group1', avg: 90 };
      mockGradeBookService.getGroupRatingData.mockResolvedValue(mockData);

      const result = await controller.getGroupRating(id);
      expect(result).toEqual(mockData);
      expect(service.getGroupRatingData).toHaveBeenCalledWith(id);
    });
  });

  describe('getGroupRatingPDF', () => {
    it('should call PDF export method with id and res', async () => {
      const res = {} as Response;
      const id = 'group1';
      await controller.getGroupRatingPDF(id, res);
      expect(service.exportGroupRatingToPdf).toHaveBeenCalledWith(id, res);
    });
  });
});
