import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        ...dto,
        isRead: dto.isRead ?? false,
        created: dto.created ? new Date(dto.created) : new Date(),
      },
    });
  }

  async findAllNotificationsForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId: userId },
    });
  }

  async findOne(id: string) {
    return await this.prisma.notification.findFirst({ where: { id } });
  }

  async makeAsRead(id: string) {
    return await this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    });
  }
}
