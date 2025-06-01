import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageManagerService } from 'src/storage-manager/storage-manager.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, PrismaService, StorageManagerService],
})
export class TaskModule {}
