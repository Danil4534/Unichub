import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Prisma, Task } from '@prisma/client';
import { TaskModule } from './task.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TaskController', () => {
  let app: INestApplication;
  const mockTaskService = {
    createTask: jest.fn(),
    parseTypes: jest.fn(),
    findAllTasks: jest.fn(),
    findOneTask: jest.fn(),
    updateTask: jest.fn(),
    updateStatusForTask: jest.fn(),
    remove: jest.fn(),
  };

  describe('TaskModule', () => {
    let module: TestingModule;

    beforeAll(async () => {
      module = await Test.createTestingModule({
        imports: [TaskModule],
      }).compile();
    });

    it('should compile the module', () => {
      expect(module).toBeDefined();
    });

    it('should provide TaskService', () => {
      const service = module.get<TaskService>(TaskService);
      expect(service).toBeInstanceOf(TaskService);
    });

    it('should provide TaskController', () => {
      const controller = module.get<TaskController>(TaskController);
      expect(controller).toBeInstanceOf(TaskController);
    });

    it('should provide PrismaService', () => {
      const prisma = module.get<PrismaService>(PrismaService);
      expect(prisma).toBeInstanceOf(PrismaService);
    });
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a task', async () => {
    const task: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Description',
      status: 0,

      type: 'Default',
      startTime: new Date(),
      endTime: new Date(),
      grade: 100,
      lessonId: '',
      subjectId: '',
    };

    mockTaskService.createTask.mockResolvedValue(task);

    return request(app.getHttpServer()).post('/task').send(task).expect(201);
  });

  it('should throw 400 on invalid query params', async () => {
    mockTaskService.parseTypes.mockImplementation(() => {
      throw new Error('Invalid');
    });

    return request(app.getHttpServer())
      .get('/task')
      .query({ where: 'invalid' })
      .expect(400)
      .expect({ statusCode: 400, message: 'Invalid query parameters' });
  });

  it('should find one task', async () => {
    const task = {
      id: '1',
      title: 'Test',
      description: '',
      status: 0,
      userId: 'u1',
    };
    mockTaskService.findOneTask.mockResolvedValue(task);

    return request(app.getHttpServer()).get('/task/1').expect(200).expect(task);
  });

  it('should update a task', async () => {
    const update = { title: 'Updated title' };
    const result = {
      id: '1',
      title: 'Updated title',
      description: '',
      status: 0,
      userId: 'u1',
    };

    mockTaskService.updateTask.mockResolvedValue(result);

    return request(app.getHttpServer())
      .put('/task/1')
      .send(update)
      .expect(200)
      .expect(result);
  });

  it('should update status for a task', async () => {
    const result = { message: 'Status updated' };
    mockTaskService.updateStatusForTask.mockResolvedValue(result);

    return request(app.getHttpServer())
      .put('/task/updateStatusForTask/1/2')
      .expect(200)
      .expect(result);
  });

  it('should delete a task', async () => {
    const result = { message: 'Task deleted' };
    mockTaskService.remove.mockResolvedValue(result);

    return request(app.getHttpServer())
      .delete('/task/1')
      .expect(200)
      .expect(result);
  });
});
