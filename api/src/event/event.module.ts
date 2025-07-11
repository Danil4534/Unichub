import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  controllers: [EventController],
  providers: [EventService, PrismaService, NotificationService],
})
export class EventModule {}
