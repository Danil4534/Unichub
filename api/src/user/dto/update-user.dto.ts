import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserSex } from '@prisma/client';
import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

     @ApiProperty({ description: "The first name of the user", example: "John" })
        @IsString()
        @IsNotEmpty()
        name: string
    
        @ApiProperty({ description: "The surname of the user", example: "Doe" })
        @IsString()
        surname: string
    
        @ApiProperty({ description: "The email of the user", example: "example@example.com" })
        @IsEmail()
        email: string
    
        @ApiProperty({ description: "The password of the user", example: "password123" })
        @IsString()
        password: string
    
        @ApiProperty({ description: "The phone of the user", example: "+380....." })
        @IsString()
        phone: string
    
        @ApiProperty({ description: "The address of the user", example: "street" })
        @IsString()
        address:string
        @ApiProperty({ description: "The img of the user", example: "street" })
        @IsString()
        img:string

        @ApiProperty({ description: "The sex of the user", enum: UserSex })
        @IsEnum(UserSex)
        sex:UserSex
        @ApiProperty({ description: "The created of the user", example: new Date})
        created:Date
     
}
