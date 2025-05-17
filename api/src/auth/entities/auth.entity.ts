import { ApiProperty } from '@nestjs/swagger';
import { Entity } from 'typeorm';

export class AuthEntity {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}
