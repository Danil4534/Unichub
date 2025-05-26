import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from './../prisma/prisma.service';
import { NotificationService } from './../notification/notification.service';
import { HttpException } from '@nestjs/common';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: {
            message: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            chat: {
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  describe('createMessage', () => {
    it('should create a message and send notification', async () => {
      const dto = { userId: 'user1', chatId: 'chat1', content: 'Hello' };

      (notificationService.create as jest.Mock).mockResolvedValue(undefined);
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: 'msg1',
        ...dto,
      });

      const result = await service.createMessage(dto);

      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New message',
          userId: dto.userId,
          description: dto.content,
          type: 'Message',
        }),
      );
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          chatId: dto.chatId,
          userId: dto.userId,
        },
      });
      expect(result).toEqual({ id: 'msg1', ...dto });
    });
  });

  describe('getMessages', () => {
    it('should return all messages if no chatId provided', async () => {
      const messages = [{ id: 'm1' }, { id: 'm2' }];
      (prisma.message.findMany as jest.Mock).mockResolvedValue(messages);

      const result = await service.getMessages();

      expect(prisma.message.findMany).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual(messages);
    });

    it('should return messages filtered by chatId', async () => {
      const chatId = 'chat1';
      const messages = [
        { id: 'm1', chatId },
        { id: 'm2', chatId },
      ];
      (prisma.message.findMany as jest.Mock).mockResolvedValue(messages);

      const result = await service.getMessages(chatId);

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId },
      });
      expect(result).toEqual(messages);
    });

    it('should throw error if prisma throws', async () => {
      (prisma.message.findMany as jest.Mock).mockRejectedValue(
        new Error('fail'),
      );

      await expect(service.getMessages()).rejects.toThrow('fail');
    });
  });

  describe('getAllUserChats', () => {
    it('should return user chats', async () => {
      const userId = 'user1';
      const chats = [{ id: 'c1' }, { id: 'c2' }];
      (prisma.chat.findMany as jest.Mock).mockResolvedValue(chats);

      const result = await service.getAllUserChats(userId);

      expect(prisma.chat.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: {
          user1: true,
          user2: true,
          messages: true,
        },
      });
      expect(result).toEqual(chats);
    });

    it('should throw HttpException if prisma throws', async () => {
      (prisma.chat.findMany as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(service.getAllUserChats('user1')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getAllChats', () => {
    it('should return all chats', async () => {
      const chats = [{ id: 'c1' }, { id: 'c2' }];
      (prisma.chat.findMany as jest.Mock).mockResolvedValue(chats);

      const result = await service.getAllChats();

      expect(prisma.chat.findMany).toHaveBeenCalledWith({
        include: { user1: true, user2: true },
      });
      expect(result).toEqual(chats);
    });

    it('should throw HttpException if prisma throws', async () => {
      (prisma.chat.findMany as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(service.getAllChats()).rejects.toThrow(HttpException);
    });
  });

  describe('createChat', () => {
    it('should create chat when both users exist', async () => {
      const dto = { userId1: 'u1', userId2: 'u2' };
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'u1' })
        .mockResolvedValueOnce({ id: 'u2' });

      const createdChat = {
        id: 'chat1',
        user1Id: dto.userId1,
        user2Id: dto.userId2,
      };
      (prisma.chat.create as jest.Mock).mockResolvedValue(createdChat);

      const result = await service.createChat(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.chat.create).toHaveBeenCalledWith({
        data: {
          user1Id: dto.userId1,
          user2Id: dto.userId2,
        },
      });
      expect(result).toEqual(createdChat);
    });

    it('should throw HttpException if one or both users do not exist', async () => {
      const dto = { userId1: 'u1', userId2: 'u2' };
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'u2' });

      await expect(service.createChat(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('deleteChat', () => {
    it('should delete chat', async () => {
      const chatId = 'chat1';
      (prisma.chat.delete as jest.Mock).mockResolvedValue({ id: chatId });

      const result = await service.deleteChat(chatId);

      expect(prisma.chat.delete).toHaveBeenCalledWith({
        where: { id: chatId },
      });
      expect(result).toEqual({ id: chatId });
    });
  });
});
