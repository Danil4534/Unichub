import { Test, TestingModule } from '@nestjs/testing';
import { TaskGradeController } from './task-grade.controller';
import { TaskGradeService } from './task-grade.service';
import { CreateTaskGradeDto } from './dto/create-task-grade.dto';

describe('TaskGradeController', () => {
  let controller: TaskGradeController;
  let service: TaskGradeService;

  const mockService = {
    assignGrade: jest.fn(),
    getGradesByUser: jest.fn(),
    getGradesByTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskGradeController],
      providers: [
        {
          provide: TaskGradeService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TaskGradeController>(TaskGradeController);
    service = module.get<TaskGradeService>(TaskGradeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('assign', () => {
    it('should call service.assignGrade with dto and return result', async () => {
      const dto: CreateTaskGradeDto = {
        taskId: 'task1',
        userId: 'user1',
        grade: 95,
      };
      const result = { success: true };

      mockService.assignGrade.mockResolvedValue(result);

      const response = await controller.assign(dto);

      expect(mockService.assignGrade).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('getByUser', () => {
    it('should call service.getGradesByUser and return grades', async () => {
      const userId = 'user1';
      const grades = [{ taskId: 't1', grade: 90 }];

      mockService.getGradesByUser.mockResolvedValue(grades);

      const response = await controller.getByUser(userId);

      expect(mockService.getGradesByUser).toHaveBeenCalledWith(userId);
      expect(response).toEqual(grades);
    });
  });

  describe('getByTask', () => {
    it('should call service.getGradesByTask and return grades', async () => {
      const taskId = 'task1';
      const grades = [{ userId: 'u1', grade: 85 }];

      mockService.getGradesByTask.mockResolvedValue(grades);

      const response = await controller.getByTask(taskId);

      expect(mockService.getGradesByTask).toHaveBeenCalledWith(taskId);
      expect(response).toEqual(grades);
    });
  });
});
