import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/Login.dto';
import RegisterDto from './dto/Register.dto';
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { StorageManagerService } from 'src/storage-manager/storage-manager.service';
import { UserService } from 'src/user/user.service';
import { AuthModule } from './auth.module';
import { EmailService } from './otp/email.service';
import { JwtStrategy } from './strategy/jwt.strategy';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeInstanceOf(AuthService);
  });

  it('should provide AuthController', () => {
    const authController = module.get<AuthController>(AuthController);
    expect(authController).toBeInstanceOf(AuthController);
  });

  it('should provide JwtStrategy', () => {
    const strategy = module.get<JwtStrategy>(JwtStrategy);
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  it('should provide PrismaClient', () => {
    const prisma = module.get<PrismaClient>(PrismaClient);
    expect(prisma).toBeInstanceOf(PrismaClient);
  });

  it('should provide UserService', () => {
    const userService = module.get<UserService>(UserService);
    expect(userService).toBeInstanceOf(UserService);
  });

  it('should provide EmailService', () => {
    const emailService = module.get<EmailService>(EmailService);
    expect(emailService).toBeInstanceOf(EmailService);
  });

  it('should provide StorageManagerService', () => {
    const storageService = module.get<StorageManagerService>(
      StorageManagerService,
    );
    expect(storageService).toBeInstanceOf(StorageManagerService);
  });
});
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    registerNewUser: jest.fn(),
    resetPassword: jest.fn(),
    sendOtpCode: jest.fn(),
    verifyOtp: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call authService.login with userData and res', async () => {
    const loginDto: LoginDTO = {
      email: 'test@example.com',
      password: 'pass123',
    };
    const res = {} as Response;

    await controller.login(loginDto, res);

    expect(authService.login).toHaveBeenCalledWith(loginDto, res);
  });

  it('should call authService.registerNewUser with userData and file info', async () => {
    const registerDto: RegisterDto = {
      email: 'user@example.com',
      name: 'User',
      password: 'securePassword',
    };
    const file = {
      buffer: Buffer.from('filedata'),
      originalname: 'avatar.png',
    } as Express.Multer.File;

    await controller.createUser(registerDto, file);

    expect(authService.registerNewUser).toHaveBeenCalledWith(
      registerDto,
      file.buffer,
      file.originalname,
    );
  });

  it('should call authService.resetPassword with email and newPassword', async () => {
    const email = 'reset@example.com';
    const newPassword = 'newPass123';

    await controller.resetPassword(email, newPassword);

    expect(authService.resetPassword).toHaveBeenCalledWith(email, newPassword);
  });

  it('should call authService.sendOtpCode with email', async () => {
    const email = 'otp@example.com';

    await controller.sendOtpCode(email);

    expect(authService.sendOtpCode).toHaveBeenCalledWith(email);
  });

  it('should call authService.verifyOtp with otp and userId', async () => {
    const userId = 'user123';
    const otp = 123456;

    await controller.verifyOtp(otp, userId);

    expect(authService.verifyOtp).toHaveBeenCalledWith(otp, userId);
  });

  it('should call authService.logout with userId', async () => {
    const userId = 'user123';

    await controller.logout(userId);

    expect(authService.logout).toHaveBeenCalledWith(userId);
  });
});
