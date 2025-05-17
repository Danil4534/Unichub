import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGroupDto {
  @ApiProperty({ description: 'The name of the group', example: 'IPZ408' })
  @IsOptional()
  @IsString()
  name?: string;
}
