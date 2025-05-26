import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { ChatModule } from './chat.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let mockServer: Partial<Server>;

  const mockClient: Partial<Socket> = {
    emit: jest.fn(),
  };

  const mockChatService = {
    createChat: jest.fn(),
    getAllUserChats: jest.fn(),
    getAllChats: jest.fn(),
    createMessage: jest.fn(),
    getMessages: jest.fn(),
    deleteChat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    gateway.server = {
      emit: jest.fn(),
    } as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
  describe('ChatModule', () => {
    let module: TestingModule;

    beforeAll(async () => {
      module = await Test.createTestingModule({
        imports: [ChatModule],
      }).compile();
    });

    it('should compile the module', () => {
      expect(module).toBeDefined();
    });

    it('should provide ChatService', () => {
      const chatService = module.get<ChatService>(ChatService);
      expect(chatService).toBeInstanceOf(ChatService);
    });

    it('should provide ChatGateway', () => {
      const chatGateway = module.get<ChatGateway>(ChatGateway);
      expect(chatGateway).toBeInstanceOf(ChatGateway);
    });

    it('should provide PrismaService', () => {
      const prismaService = module.get<PrismaService>(PrismaService);
      expect(prismaService).toBeInstanceOf(PrismaService);
    });

    it('should provide NotificationService', () => {
      const notificationService =
        module.get<NotificationService>(NotificationService);
      expect(notificationService).toBeInstanceOf(NotificationService);
    });
  });
  describe('handleCreateChat', () => {
    it('should create chat and emit updates', async () => {
      const dto = { userId1: 'user1', userId2: 'user2' };
      const newChat = { id: 'chat1' };
      const updatedChats = [{ id: 'chat1' }];

      mockChatService.createChat.mockResolvedValue(newChat);
      mockChatService.getAllUserChats.mockResolvedValue(updatedChats);

      const result = await gateway.handleCreateChat(dto, mockClient as Socket);

      expect(mockChatService.createChat).toHaveBeenCalledWith(dto);
      expect(mockChatService.getAllUserChats).toHaveBeenCalledWith('user1');
      expect(gateway.server.emit).toHaveBeenCalledWith(
        'chatsUpdated',
        updatedChats,
      );
      expect(mockClient.emit).toHaveBeenCalledWith('chatCreated', newChat);
      expect(result).toEqual(newChat);
    });
  });

  describe('getAllChats', () => {
    it('should emit all chats', async () => {
      const chats = [{ id: '1' }];
      mockChatService.getAllChats.mockResolvedValue(chats);

      await gateway.getAllChats(mockClient as Socket);

      expect(mockChatService.getAllChats).toHaveBeenCalled();
      expect(mockClient.emit).toHaveBeenCalledWith('chats', chats);
    });
  });

  describe('getUserChats', () => {
    it('should emit user chats to server', async () => {
      const userChats = [{ id: 'chat1' }];
      mockChatService.getAllUserChats.mockResolvedValue(userChats);

      await gateway.getUserChats('user1');

      expect(mockChatService.getAllUserChats).toHaveBeenCalledWith('user1');
      expect(gateway.server.emit).toHaveBeenCalledWith('userChats', userChats);
    });
  });

  describe('sendMessage', () => {
    it('should create and emit message', async () => {
      const dto = { chatId: 'chat1', userId: 'user1', content: 'hi' };
      const message = { id: 'msg1', ...dto };

      mockChatService.createMessage.mockResolvedValue(message);

      await gateway.sendMessage(dto, mockClient as Socket);

      expect(mockChatService.createMessage).toHaveBeenCalledWith(dto);
      expect(gateway.server.emit).toHaveBeenCalledWith('message', message);
    });
  });

  describe('handleGetMessage', () => {
    it('should emit and return messages', async () => {
      const messages = [{ id: 'msg1' }];
      mockChatService.getMessages.mockResolvedValue(messages);

      const result = await gateway.handleGetMessage(
        'chat1',
        mockClient as Socket,
      );

      expect(mockChatService.getMessages).toHaveBeenCalledWith('chat1');
      expect(mockClient.emit).toHaveBeenCalledWith('getMessages', messages);
      expect(result).toEqual(messages);
    });
  });

  describe('handleDeleteChat', () => {
    it('should delete chat and return result', async () => {
      const result = { success: true };
      mockChatService.deleteChat.mockResolvedValue(result);

      const response = await gateway.handleDeleteChat(
        'chat1',
        mockClient as Socket,
      );

      expect(mockChatService.deleteChat).toHaveBeenCalledWith('chat1');
      expect(response).toEqual(result);
    });
  });
});
