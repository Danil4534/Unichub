import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { Server, Socket } from 'socket.io';
import { NotificationModule } from './notification.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let notificationService: NotificationService;

  const mockNotificationService = {
    findAllNotificationsForUser: jest.fn(),
    makeAsRead: jest.fn(),
  };

  // Создаём мок сокета
  const mockClient = {
    emit: jest.fn(),
  } as unknown as Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleNotifications', () => {
    it('should call service and emit notifications event', async () => {
      const userId = 'user123';
      const notifications = [{ id: 'notif1', message: 'Hello' }];

      mockNotificationService.findAllNotificationsForUser.mockResolvedValue(
        notifications,
      );

      await gateway.handleNotifications(mockClient, userId);

      expect(
        notificationService.findAllNotificationsForUser,
      ).toHaveBeenCalledWith(userId);
      expect(mockClient.emit).toHaveBeenCalledWith(
        'notifications',
        notifications,
      );
    });
  });
  describe('NotificationModule', () => {
    let module: TestingModule;

    beforeAll(async () => {
      module = await Test.createTestingModule({
        imports: [NotificationModule],
      }).compile();
    });

    it('should compile the module', () => {
      expect(module).toBeDefined();
    });

    it('should provide NotificationService', () => {
      const service = module.get<NotificationService>(NotificationService);
      expect(service).toBeInstanceOf(NotificationService);
    });

    it('should provide NotificationGateway', () => {
      const gateway = module.get<NotificationGateway>(NotificationGateway);
      expect(gateway).toBeInstanceOf(NotificationGateway);
    });

    it('should provide PrismaService', () => {
      const prisma = module.get<PrismaService>(PrismaService);
      expect(prisma).toBeInstanceOf(PrismaService);
    });
  });
  describe('handleMarkAsRead', () => {
    it('should call service and emit notificationRead event', async () => {
      const payload = { id: 'notif1' };
      const updatedNotification = { id: 'notif1', read: true };

      mockNotificationService.makeAsRead.mockResolvedValue(updatedNotification);

      await gateway.handleMarkAsRead(mockClient, payload);

      expect(notificationService.makeAsRead).toHaveBeenCalledWith(payload.id);
      expect(mockClient.emit).toHaveBeenCalledWith(
        'notificationRead',
        updatedNotification,
      );
    });
  });
});
