import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UploadedFile,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/Login.dto';

import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import RegisterDto from './dto/Register.dto';
import { Express, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDTO, description: 'Example login data.' })
  async login(@Body() userData: LoginDTO, @Res() res: Response) {
    return await this.authService.login(userData, res);
  }

  @ApiBody({ type: RegisterDto, description: 'User registration data.' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @Post('register')
  @UseInterceptors(FileInterceptor('file'))
  async createUser(
    @Body() userData: RegisterDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.authService.registerNewUser(
      userData,
      file.buffer,
      file.originalname,
    );
  }

  @Put('resetPassword/:email/:newPassword')
  async resetPassword(
    @Param('email') email: string,
    @Param('newPassword') newPassword: string,
  ) {
    return await this.authService.resetPassword(email, newPassword);
  }

  @Post('sendOtpCode/:email')
  async sendOtpCode(@Param('email') email: string) {
    return await this.authService.sendOtpCode(email);
  }

  @Post('verify-otp/:userId/:otp')
  async verifyOtp(
    @Param('otp') otp: number,
    @Param('userId') userId: string,
  ): Promise<string> {
    return this.authService.verifyOtp(otp, userId);
  }

  @Post('logout/:userId')
  async logout(@Param('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
