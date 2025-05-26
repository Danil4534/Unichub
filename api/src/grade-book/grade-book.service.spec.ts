import { GradeBookService } from './grade-book.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

jest.mock('fs');
jest.mock('exceljs', () => {
  return {
    Workbook: jest.fn().mockImplementation(() => ({
      xlsx: {
        writeFile: jest.fn().mockResolvedValue(undefined),
      },
      addWorksheet: jest.fn().mockReturnValue({
        columns: [],
        addRow: jest.fn().mockImplementation(() => {
          return {
            font: undefined,
            getCell: jest.fn().mockImplementation(() => {
              return {
                fill: undefined,
              };
            }),
            eachCell: jest.fn((callback: (cell: any) => void) => {
              callback({ font: undefined, fill: undefined });
            }),
          };
        }),
        getRow: jest.fn().mockImplementation(() => {
          return {
            font: {},
            eachCell: jest.fn((callback: (cell: any) => void) => {
              callback({ font: {} });
            }),
          };
        }),
      }),
    })),
  };
});

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    end: jest.fn(),
    on: jest.fn(),
  }));
});

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.download = jest
    .fn()
    .mockImplementation((path: string, ...args: any[]) => {
      const cb = args.find((arg) => typeof arg === 'function');
      if (cb) cb();
      return res;
    });
  return res as Response;
};

describe('GradeBookService', () => {
  let service: GradeBookService;
  let prisma: PrismaService;
  let res: Response;

  beforeEach(() => {
    prisma = {
      group: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    } as any as PrismaService;

    service = new GradeBookService(prisma);
    res = mockResponse();
  });

  describe('getAllSubjectGradesWithTasks', () => {
    it('should return group data with students and task grades', async () => {
      const mockData = [
        { id: 'g1', students: [{ TaskGrade: [{ id: 'tg1', grade: 90 }] }] },
      ];
      (prisma.group.findMany as jest.Mock).mockResolvedValue(mockData);

      const result = await service.getAllSubjectGradesWithTasks('user1');

      expect(prisma.group.findMany).toBeCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getGroupRatingData', () => {
    it('should throw error if group not found', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getGroupRatingData('group1')).rejects.toThrow(
        'Group not found',
      );
    });

    it('should return rating data with sorted students', async () => {
      const groupMock = {
        id: 'group1',
        name: 'Group1',
        subjects: [{ name: 'Math' }, { name: 'Physics' }],
        students: [
          {
            id: 'stu1',
            name: 'John',
            surname: 'Doe',
            roles: [],
            TaskGrade: [
              {
                grade: 80,
                task: { Subject: { name: 'Math' } },
              },
              {
                grade: 90,
                task: { Subject: { name: 'Physics' } },
              },
            ],
          },
          {
            id: 'stu2',
            name: 'Jane',
            surname: 'Smith',
            roles: ['Admin'], // Should be filtered out
            TaskGrade: [],
          },
        ],
      };

      (prisma.group.findUnique as jest.Mock).mockResolvedValue(groupMock);

      const result = await service.getGroupRatingData('group1');

      expect(result.headers).toEqual([
        'Student ID',
        'Name Surname',
        'Group',
        'Math',
        'Physics',
        'Average',
      ]);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0][0]).toBe('stu1');
      expect(result.rows[0][3]).toBe('80.00');
      expect(result.rows[0][4]).toBe('90.00');
    });
  });

  describe('exportGroupRatingToExcel', () => {
    it('should respond with 404 if group not found', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(null);

      await service.exportGroupRatingToExcel('group1', res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Group not found');
    });

    it('should generate and download excel file', async () => {
      const groupMock = {
        id: 'group1',
        name: 'Group1',
        subjects: [{ name: 'Math' }],
        students: [
          {
            id: 'stu1',
            name: 'John',
            surname: 'Doe',
            roles: [],
            TaskGrade: [{ grade: 80, task: { Subject: { name: 'Math' } } }],
          },
        ],
      };
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(groupMock);

      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      await service.exportGroupRatingToExcel('group1', res);

      expect(res.download).toHaveBeenCalled();
    });
  });

  describe('exportGroupedRatingsToExcel', () => {
    it('should generate and download excel for multiple groups', async () => {
      const groupsMock = [
        {
          id: 'group1',
          name: 'Group1',
          subjects: [{ name: 'Math' }],
          students: [
            {
              id: 'stu1',
              name: 'John',
              surname: 'Doe',
              roles: [],
              TaskGrade: [{ grade: 80, task: { Subject: { name: 'Math' } } }],
            },
          ],
        },
        {
          id: 'group2',
          name: 'Group2',
          subjects: [{ name: 'Physics' }],
          students: [
            {
              id: 'stu2',
              name: 'Jane',
              surname: 'Smith',
              roles: [],
              TaskGrade: [
                { grade: 90, task: { Subject: { name: 'Physics' } } },
              ],
            },
          ],
        },
      ];

      (prisma.group.findMany as jest.Mock).mockResolvedValue(groupsMock);

      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      await service.exportGroupedRatingsToExcel(res);

      expect(res.download).toHaveBeenCalled();
    });
  });
});
