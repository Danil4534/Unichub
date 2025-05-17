import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ description: 'The name of the group', example: 'IPZ408' })
  @IsString()
  name?: String;
}
