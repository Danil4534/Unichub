import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Title of the event',
    example: 'Parent-Teacher Meeting',
  })
  title: string;
  @ApiProperty({
    description: 'Description of the event',
    example: 'Discussion about students performance and progress',
  })
  description: string;
  @ApiProperty({
    description: 'Start time of the event ',
    example: '2025-04-05T10:00:00.000Z',
  })
  @IsDateString()
  start: Date;

  @ApiProperty({
    description: 'End time of the event ',
    example: '2025-04-05T12:00:00.000Z',
  })
  @IsDateString()
  end: Date;
  @ApiProperty({
    description: 'Status for event',
    example: 'New',
  })
  @IsString()
  status: string;
  @ApiProperty({
    description: 'Date when the event was created ',
    example: '2025-04-01T08:30:00.000Z',
  })
  @IsDateString()
  created: Date;

  @ApiPropertyOptional({
    description: 'Group ID to which the event belongs',
    example: 'group-uuid-123',
  })
  @IsOptional()
  @IsString()
  groupId?: string;
}
