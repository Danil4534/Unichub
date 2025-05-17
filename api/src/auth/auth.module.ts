import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaClient } from '@prisma/client';
import { RefreshStrategy } from './strategy/rt.strategy';
import { UserService } from 'src/user/user.service';
import { EmailService } from './otp/email.service';
import { StorageManagerService } from 'src/storage-manager/storage-manager.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT,
      signOptions: { expiresIn: '5m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaClient,
    RefreshStrategy,
    UserService,
    EmailService,
    StorageManagerService,
  ],
})
export class AuthModule {}
