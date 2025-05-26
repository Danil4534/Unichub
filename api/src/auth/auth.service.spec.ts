import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { EmailService } from './otp/email.service';
import * as bcrypt from 'bcryptjs';
import { HttpException, NotFoundException } from '@nestjs/common';

// Mock Response object for Express
const mockResponse = () => {
  const res: any = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let userService: UserService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            hashedPassword: jest.fn(),
            createNewUser: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendToEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('login', () => {
    it('should throw error if user not found', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      const res = mockResponse();

      await expect(
        service.login({ email: 'test@example.com', password: '1234' }, res),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if password is invalid', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        email: 'test@example.com',
        password: 'hashedPassword',
        banned: false,
        name: 'Test User',
      });

      const res = mockResponse();

      await expect(
        service.login(
          { email: 'test@example.com', password: 'wrongpass' },
          res,
        ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('logout', () => {
    const userId = 'user-123';

    it('should log out the user and return success message', async () => {
      const mockUser = { id: userId, activeStatus: 'Online' };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        activeStatus: 'Offline',
      });

      const result = await service.logout(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { activeStatus: 'Offline' },
      });

      expect(result).toBe('User logged out successfully');
    });

    it('should throw NotFoundException if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.logout(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
