import { UserSex } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export default class RegisterDto {
  @ApiProperty({ description: 'The first name of the user', example: 'John' })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ description: 'The surname of the user', example: 'Doe' })
  @IsString()
  surname?: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'example@example.com',
  })
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'The phone of the user', example: '+380.....' })
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({ description: 'The img of the user', example: 'street' })
  @IsString()
  img?: string;

  @ApiProperty({ description: 'The sex of the user', enum: UserSex })
  @IsEnum(UserSex)
  sex?: UserSex;

  @ApiProperty({
    description: 'The info of the user',
    example: 'Senior Lecturer',
  })
  @IsString()
  info?: string;
}
