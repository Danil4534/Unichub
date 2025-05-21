import {
  IsString,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsDateString()
  created?: Date;
}
