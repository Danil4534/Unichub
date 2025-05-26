import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Prisma, Event } from '@prisma/client';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  const mockEvent: Event = {
    id: '1',
    title: 'Test Event',
    description: 'Desc',
    groupId: 'group1',
    start: new Date(),
    end: new Date(),
    status: '',
    created: new Date(),
  };

  const mockEventService = {
    createEvent: jest.fn((dto) => Promise.resolve({ id: '1', ...dto })),
    findAllEvents: jest.fn(() => Promise.resolve([mockEvent])),
    findOneEvent: jest.fn((id) => Promise.resolve(mockEvent)),
    findEventsForGroup: jest.fn((groupId) => Promise.resolve([mockEvent])),
    updateEvent: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn((id) => Promise.resolve({ id })),
    parseTypes: jest.fn((where, orderBy, skip, take) =>
      Promise.resolve({
        where: where ? JSON.parse(where) : undefined,
        orderBy: orderBy ? JSON.parse(orderBy) : undefined,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockEventService }],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call createEvent and return result', async () => {
      const dto = { title: 'New Event' } as Prisma.EventCreateInput;
      const result = await controller.create(dto);
      expect(service.createEvent).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: '1', ...dto });
    });
  });

  describe('findAllEvents', () => {
    it('should parse query and return events', async () => {
      const where = JSON.stringify({ title: { contains: 'test' } });
      const orderBy = JSON.stringify({ date: 'desc' });
      const skip = '0';
      const take = '10';

      const result = await controller.findAllEvents(where, orderBy, skip, take);

      expect(service.parseTypes).toHaveBeenCalledWith(
        where,
        orderBy,
        skip,
        take,
      );
      expect(service.findAllEvents).toHaveBeenCalledWith({
        where: { title: { contains: 'test' } },
        orderBy: { date: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual([mockEvent]);
    });

    it('should throw HttpException on parse error', async () => {
      service.parseTypes = jest.fn(() => {
        throw new Error('Invalid JSON');
      });

      await expect(
        controller.findAllEvents('bad json', undefined, undefined, undefined),
      ).rejects.toThrow();
    });
  });

  describe('findOneEvent', () => {
    it('should return an event by id', async () => {
      const id = '1';
      const result = await controller.findOneEvent(id);
      expect(service.findOneEvent).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findEventsForGroup', () => {
    it('should return events for a group', async () => {
      const groupId = 'group1';
      const result = await controller.findEventsForGroup(groupId);
      expect(service.findEventsForGroup).toHaveBeenCalledWith(groupId);
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('update', () => {
    it('should update and return event', async () => {
      const id = '1';
      const updateDto = { title: 'Updated' };
      const result = await controller.update(id, updateDto);
      expect(service.updateEvent).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual({ id, ...updateDto });
    });
  });

  describe('remove', () => {
    it('should call remove and return result', async () => {
      const id = '1';
      const result = await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id });
    });
  });
});
