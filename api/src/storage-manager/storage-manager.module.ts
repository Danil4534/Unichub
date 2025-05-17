import { Module } from '@nestjs/common';
import { StorageManagerService } from './storage-manager.service';
import { StorageManagerController } from './storage-manager.controller';

@Module({
  controllers: [StorageManagerController],
  providers: [StorageManagerService],
})
export class StorageManagerModule {}
