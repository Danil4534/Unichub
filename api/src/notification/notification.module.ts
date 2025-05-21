import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [NotificationGateway, NotificationService, PrismaService],
})
export class NotificationModule {}
