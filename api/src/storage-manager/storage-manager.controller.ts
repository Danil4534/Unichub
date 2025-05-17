import { Controller } from '@nestjs/common';
import { StorageManagerService } from './storage-manager.service';

@Controller('storage-manager')
export class StorageManagerController {
  constructor(private readonly storageManagerService: StorageManagerService) {}
}
