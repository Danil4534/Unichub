import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

import { PrismaService } from './prisma/prisma.service';

import { ChatModule } from './chat/chat.module';
import { GroupModule } from './group/group.module';
import { SubjectModule } from './subject/subject.module';
import { LessonModule } from './lesson/lesson.module';
import { TaskModule } from './task/task.module';
import { EventModule } from './event/event.module';
import { StorageManagerModule } from './storage-manager/storage-manager.module';

import { GradeBookModule } from './grade-book/grade-book.module';
import { TaskGradeModule } from './task-grade/task-grade.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    AuthModule,
    UserModule,

    ChatModule,
    GroupModule,
    SubjectModule,
    LessonModule,
    TaskModule,
    EventModule,
    StorageManagerModule,

    GradeBookModule,
    TaskGradeModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
