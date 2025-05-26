import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaClient, User, Role, $Enums } from '@prisma/client';
import { StorageManagerService } from 'src/storage-manager/storage-manager.service';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaClient;
  let storageManagerService: StorageManagerService;

  beforeEach(async () => {
    const prismaMock = {
      user: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as PrismaClient;

    const storageManagerMock = {
      uploadPublicFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaClient, useValue: prismaMock },
        { provide: StorageManagerService, useValue: storageManagerMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaClient>(PrismaClient);
    storageManagerService = module.get<StorageManagerService>(
      StorageManagerService,
    );
  });

  describe('findUserById', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      } as User;
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser);

      const user = await service.findUserById('1');
      expect(user).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { Comment: true },
      });
    });

    it('should throw HttpException when user not found', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(service.findUserById('1')).rejects.toThrow(HttpException);
    });
  });

  describe('toggleBanUser', () => {
    it('should ban a user', async () => {
      jest
        .spyOn(service, 'findUserById')
        .mockResolvedValue({ id: '1' } as User);
      jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue({ id: '1', banned: true } as any);

      const result = await service.toggleBanUser('1', true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { banned: true },
      });
      expect(result).toBe('User has been banned');
    });
  });

  describe('createNewUser', () => {
    it('should create user and upload image', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password',
      } as any;

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(storageManagerService, 'uploadPublicFile')
        .mockResolvedValue({ Location: 'url-to-image' } as any);
      jest.spyOn(service, 'hashedPassword').mockResolvedValue('hashedpassword');

      const newUser = await service.createNewUser(
        userData,
        Buffer.from('file'),
        'file.png',
      );
      expect(newUser.img).toBe('url-to-image');
      expect(newUser.password).toBe('hashedpassword');
    });

    it('should throw if user exists', async () => {
      jest
        .spyOn(prisma.user, 'findFirst')
        .mockResolvedValue({ id: 'exists' } as User);
      await expect(
        service.createNewUser(
          { email: 'exists@example.com', password: 'p' } as any,
          Buffer.from(''),
          '',
        ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('parseRole', () => {
    it('should parse roles correctly', async () => {
      const roles = 'admin, teacher';
      const parsed = await service.parseRole(roles);
      expect(parsed).toEqual([$Enums.Role.Admin, $Enums.Role.Teacher]);
    });

    it('should throw on invalid role', async () => {
      await expect(service.parseRole('invalidrole')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
