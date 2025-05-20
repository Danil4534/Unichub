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
        { provide: GradeBookService, useValue: mockGradeBookService },
      ],
    }).compile();

    controller = module.get<GradeBookController>(GradeBookController);
    service = module.get<GradeBookService>(GradeBookService);

    jest.clearAllMocks();
  });

  describe('getUserSubjectsWithTaskGrades', () => {
    it('should call service and return data', async () => {
      const userId = '123';
      const result = [{ subject: 'Math', grades: [90, 80] }];
      mockGradeBookService.getAllSubjectGradesWithTasks.mockResolvedValue(
        result,
      );

      expect(await controller.getUserSubjectsWithTaskGrades(userId)).toBe(
        result,
      );
      expect(
        mockGradeBookService.getAllSubjectGradesWithTasks,
      ).toHaveBeenCalledWith(userId);
    });
  });

  describe('exportGroupedRatings', () => {
    it('should call service with response object', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        download: jest.fn(),
      } as unknown as Response;

      await controller.exportGroupedRatings(res);

      expect(
        mockGradeBookService.exportGroupedRatingsToExcel,
      ).toHaveBeenCalledWith(res);
    });
  });

  describe('exportGroupRating', () => {
    it('should call service with id and response', async () => {
      const id = 'group123';
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        download: jest.fn(),
      } as unknown as Response;

      await controller.exportGroupRating(id, res);

      expect(
        mockGradeBookService.exportGroupRatingToExcel,
      ).toHaveBeenCalledWith(id, res);
    });
  });

  describe('getGroupRating', () => {
    it('should call service with group id and return data', async () => {
      const id = 'group456';
      const result = { headers: ['header1'], rows: [['row1']] };
      mockGradeBookService.getGroupRatingData.mockResolvedValue(result);

      expect(await controller.getGroupRating(id)).toBe(result);
      expect(mockGradeBookService.getGroupRatingData).toHaveBeenCalledWith(id);
    });
  });

  describe('getGroupRatingPDF', () => {
    it('should call service with group id and response', async () => {
      const id = 'pdfGroup789';
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        download: jest.fn(),
      } as unknown as Response;

      await controller.getGroupRatingPDF(id, res);

      expect(mockGradeBookService.exportGroupRatingToPdf).toHaveBeenCalledWith(
        id,
        res,
      );
    });
  });
});
