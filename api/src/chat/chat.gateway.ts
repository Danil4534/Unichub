import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('createChat')
  async handleCreateChat(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const newChat = await this.chatService.createChat(createChatDto);
    const updatedChats = await this.chatService.getAllUserChats(
      createChatDto.userId1,
    );
    this.server.emit('chatsUpdated', updatedChats);
    client.emit('chatCreated', newChat);
    return newChat;
  }

  @SubscribeMessage('getAllChats')
  async getAllChats(client: Socket) {
    const chats = await this.chatService.getAllChats();
    client.emit('chats', chats);
  }

  @SubscribeMessage('getUserChats')
  async getUserChats(@ConnectedSocket() client, @MessageBody() userId: string) {
    const userChats = await this.chatService.getAllUserChats(userId);
    client.emit('userChats', userChats);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() createChatDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.createMessage(createChatDto);
    this.server.emit('message', message);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessage(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.getMessages(chatId);
    client.emit('getMessages', messages);
    return messages;
  }
  @SubscribeMessage('deleteChat')
  async handleDeleteChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.deleteChat(chatId);
    return messages;
  }
}
