import { PrismaService } from './../prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(dto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        content: dto.content,
        chatId: dto.chatId,
        userId: dto.userId,
      },
    });
  }

  async getMessages(chatId?: string) {
    try {
      const messages = await this.prisma.message.findMany({
        where: chatId ? { chatId } : {},
      });

      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
  async getAllUserChats(userId: string) {
    try {
      const chats = await this.prisma.chat.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: {
          user1: true,
          user2: true,
          messages: true,
        },
      });
      return chats;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_GATEWAY);
    }
  }

  async getAllChats() {
    try {
      const allChats = await this.prisma.chat.findMany({
        include: { user1: true, user2: true },
      });
      return allChats;
    } catch (e) {
      console.log(e);
      throw new HttpException(e, HttpStatus.BAD_GATEWAY);
    }
  }
  async createChat(dto: CreateChatDto) {
    const user1Exists = await this.prisma.user.findUnique({
      where: { id: dto.userId1 },
    });
    const user2Exists = await this.prisma.user.findUnique({
      where: { id: dto.userId2 },
    });
    if (!user1Exists || !user2Exists) {
      throw new HttpException(
        'One or both users not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.prisma.chat.create({
      data: {
        user1Id: dto.userId1,
        user2Id: dto.userId2,
      },
    });
  }

  async deleteChat(chatId) {
    return this.prisma.chat.delete({
      where: { id: chatId },
    });
  }
}
