import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleGuard } from 'src/auth/guard/RoleGuard';
import { JwtModule } from '@nestjs/jwt';
import { EventService } from 'src/event/event.service';

@Module({
  imports: [JwtModule],
  controllers: [LessonController],
  providers: [LessonService, PrismaService, EventService],
})
export class LessonModule {}
