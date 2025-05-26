import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: PrismaService;

  const mockPrisma = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification with default isRead and created date', async () => {
      const dto = { userId: 'user1', message: 'Hello' };
      const createdNotification = {
        id: '1',
        ...dto,
        isRead: false,
        created: new Date(),
      };

      mockPrisma.notification.create.mockResolvedValue(createdNotification);

      const result = await service.create(dto as any);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user1',
          message: 'Hello',
          isRead: false,
          created: expect.any(Date),
        }),
      });
      expect(result).toEqual(createdNotification);
    });

    it('should use provided isRead and created', async () => {
      const dateStr = '2025-05-25T10:00:00.000Z';
      const dto = {
        userId: 'user2',
        message: 'Test',
        isRead: true,
        created: dateStr,
      };
      const createdNotification = {
        id: '2',
        ...dto,
        created: new Date(dateStr),
      };

      mockPrisma.notification.create.mockResolvedValue(createdNotification);

      const result = await service.create(dto as any);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isRead: true,
          created: new Date(dateStr),
        }),
      });
      expect(result).toEqual(createdNotification);
    });
  });

  describe('findAllNotificationsForUser', () => {
    it('should return notifications for given userId', async () => {
      const notifications = [{ id: '1', userId: 'user1' }];

      mockPrisma.notification.findMany.mockResolvedValue(notifications);

      const result = await service.findAllNotificationsForUser('user1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
      expect(result).toEqual(notifications);
    });
  });

  describe('findOne', () => {
    it('should return notification by id', async () => {
      const notification = { id: '1', userId: 'user1' };

      mockPrisma.notification.findFirst.mockResolvedValue(notification);

      const result = await service.findOne('1');

      expect(prisma.notification.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(notification);
    });
  });

  describe('makeAsRead', () => {
    it('should update notification isRead to true', async () => {
      const updatedNotification = { id: '1', isRead: true };

      mockPrisma.notification.update.mockResolvedValue(updatedNotification);

      const result = await service.makeAsRead('1');

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isRead: true },
      });
      expect(result).toEqual(updatedNotification);
    });
  });
});
