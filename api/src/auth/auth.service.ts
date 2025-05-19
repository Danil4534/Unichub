import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO } from './dto/Login.dto';
import RegisterDto from './dto/Register.dto';
import { AuthEntity } from './entities/auth.entity';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { $Enums } from '@prisma/client';
import { EmailService } from './otp/email.service';
import { Response } from 'express';
import { HttpError } from 'postmark/dist/client/errors/Errors';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private emailService: EmailService,
  ) {}

  async login(userData: LoginDTO, res: Response) {
    const { email, password } = userData;
    const otpCode = this.generateOtpCode();
    const foundUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!foundUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }

    if (email !== 'admin@gmail.com' && !foundUser.banned) {
      await this.emailService.sendToEmail({
        toEmail: email,
        username: foundUser.name,
        code: otpCode,
      });
    }

    await this.prisma.user.update({
      where: { email: email },
      data: {
        activeStatus: $Enums.UserStatus.Online,
        otpCode: otpCode,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const accessToken = await this.jwtService.signAsync(
      { userId: foundUser },
      { expiresIn: '15m' },
    );
    console.log(accessToken);
    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    const refreshToken = this.jwtService.signAsync(
      { userId: foundUser },
      { expiresIn: '30d' },
    );

    return res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }

  async verifyOtp(otp: number, userId: string): Promise<string> {
    const foundUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!foundUser.otpCode || new Date(foundUser.otpExpiresAt) < new Date()) {
      throw new UnauthorizedException('OTP has expired or is invalid');
    }
    if (foundUser.otpCode != otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { otpCode: null, otpExpiresAt: null },
    });
    return 'Success';
  }
  async sendOtpCode(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email },
    });
    const otpCode = this.generateOtpCode();
    if (user) {
      await this.emailService.sendToEmail({
        toEmail: email,
        username: user.name,
        code: otpCode,
      });
      console.log('Send');
    }
  }

  async resetPassword(email: string, newPassword: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: email },
      });
      const result = await this.prisma.user.update({
        where: { email },
        data: {
          password: await this.userService.hashedPassword(newPassword),
        },
      });
      return result;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  generateOtpCode(): number {
    return Math.floor(100000 + Math.random() * 90000);
  }

  async registerNewUser(userData: RegisterDto, file: Buffer, fileName: string) {
    return this.userService.createNewUser(userData, file, fileName);
  }

  async logout(userId: string): Promise<string> {
    const foundUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { activeStatus: $Enums.UserStatus.Offline },
    });

    return 'User logged out successfully';
  }
}
