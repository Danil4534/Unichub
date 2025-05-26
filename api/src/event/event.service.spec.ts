import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventModule } from './event.module';
describe('EventModule', () => {
  let module: TestingModule;
  let eventService: EventService;
  let eventController: EventController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [EventModule],
    }).compile();

    eventService = module.get<EventService>(EventService);
    eventController = module.get<EventController>(EventController);
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should have EventService defined', () => {
    expect(eventService).toBeDefined();
  });

  it('should have EventController defined', () => {
    expect(eventController).toBeDefined();
  });

  it('EventController.findAllEvents should call EventService.findAllEvents', async () => {
    const spy = jest.spyOn(eventService, 'findAllEvents').mockResolvedValue([]);
    await eventController.findAllEvents();
    expect(spy).toHaveBeenCalled();
  });
});
describe('EventService', () => {
  let service: EventService;
  let prisma: PrismaService;
  let notificationService: NotificationService;

  const mockPrisma = {
    event: {
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockNotificationService = {
    // если нужны методы для тестов — добавьте сюда
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);

    jest.clearAllMocks();
  });

  describe('findAllEvents', () => {
    it('должен вернуть обновленный список событий', async () => {
      const now = new Date();
      const events = [
        {
          id: '1',
          start: new Date(now.getTime() - 1000),
          status: 'New',
          group: {},
        },
        {
          id: '2',
          start: new Date(now.getTime() + 1000),
          status: 'New',
          group: {},
        },
      ];
      mockPrisma.event.findMany.mockResolvedValue(events);
      mockPrisma.event.update.mockImplementation(({ where, data }) =>
        Promise.resolve({
          ...events.find((e) => e.id === where.id),
          status: data.status,
          group: {},
        }),
      );

      const result = await service.findAllEvents({});

      expect(prisma.event.findMany).toHaveBeenCalled();
      expect(prisma.event.update).toHaveBeenCalledTimes(events.length);
      expect(result[0].status).toBe('Old');
      expect(result[1].status).toBe('New');
    });
  });

  describe('findEventsForGroup', () => {
    it('должен вернуть события группы', async () => {
      const now = new Date();
      const events = [
        {
          id: '1',
          groupId: 'g1',
          start: new Date(now.getTime() - 1000),
          status: 'New',
        },
        {
          id: '2',
          groupId: 'g1',
          start: new Date(now.getTime() + 1000),
          status: 'New',
        },
      ];
      mockPrisma.event.findMany.mockResolvedValue(events);
      mockPrisma.event.update.mockResolvedValue({});

      const result = await service.findEventsForGroup('g1');

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { groupId: 'g1' },
      });
      expect(prisma.event.update).toHaveBeenCalledTimes(events.length);
      expect(result).toEqual(events);
    });
  });

  describe('createEvent', () => {
    it('должен создать событие', async () => {
      const createDto = { title: 'Event' } as any;
      const createdEvent = { id: '1', ...createDto, created: new Date() };
      mockPrisma.event.create.mockResolvedValue(createdEvent);

      const result = await service.createEvent(createDto);

      expect(prisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining(createDto),
      });
      expect(result).toEqual(createdEvent);
    });

    it('должен бросить HttpException при ошибке создания', async () => {
      mockPrisma.event.create.mockRejectedValue(new Error('fail'));

      await expect(service.createEvent({} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findOneEvent', () => {
    it('должен вернуть событие по id', async () => {
      const event = { id: '1', title: 'Test Event' };
      mockPrisma.event.findFirst.mockResolvedValue(event);

      const result = await service.findOneEvent('1');

      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(event);
    });

    it('должен бросить HttpException при ошибке', async () => {
      mockPrisma.event.findFirst.mockRejectedValue(new Error('fail'));

      await expect(service.findOneEvent('1')).rejects.toThrow(HttpException);
    });
  });

  describe('updateEvent', () => {
    it('должен обновить событие', async () => {
      const updateDto = { title: 'Updated' } as any;
      const updatedEvent = { id: '1', ...updateDto };
      mockPrisma.event.update.mockResolvedValue(updatedEvent);

      const result = await service.updateEvent('1', updateDto);

      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedEvent);
    });

    it('должен бросить HttpException при ошибке', async () => {
      mockPrisma.event.update.mockRejectedValue(new Error('fail'));

      await expect(service.updateEvent('1', {} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('remove', () => {
    it('должен удалить событие, если оно существует', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.event.delete.mockResolvedValue({});

      await service.remove('1');

      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('не должен удалять, если событие не найдено', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await service.remove('1');

      expect(prisma.event.delete).not.toHaveBeenCalled();
    });

    it('должен бросить HttpException при ошибке', async () => {
      mockPrisma.event.findFirst.mockRejectedValue(new Error('fail'));

      await expect(service.remove('1')).rejects.toThrow(HttpException);
    });
  });

  describe('parseTypes', () => {
    it('должен корректно распарсить входные параметры', () => {
      const where = JSON.stringify({ title: { contains: 'test' } });
      const orderBy = JSON.stringify({ created: 'desc' });
      const skip = '5';
      const take = '10';

      const result = service.parseTypes(where, orderBy, skip, take);

      expect(result.where).toEqual({ title: { contains: 'test' } });
      expect(result.orderBy).toEqual({ created: 'desc' });
      expect(result.skip).toBe(5);
      expect(result.take).toBe(10);
    });

    it('должен задать значения по умолчанию при отсутствии параметров', () => {
      const result = service.parseTypes(
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(result.where).toBeUndefined();
      expect(result.orderBy).toBeUndefined();
      expect(result.skip).toBe(0);
      expect(result.take).toBeUndefined();
    });
  });
});
