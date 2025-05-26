import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Prisma, User } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';

import { UserModule } from './user.module';

import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { StorageManagerService } from 'src/storage-manager/storage-manager.service';

describe('UserModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();
  });

  it('should compile module successfully', () => {
    expect(module).toBeDefined();
  });

  it('should have UserService provider', () => {
    const service = module.get<UserService>(UserService);
    expect(service).toBeDefined();
  });

  it('should have UserController', () => {
    const controller = module.get<UserController>(UserController);
    expect(controller).toBeDefined();
  });

  it('should have PrismaClient provider', () => {
    const prisma = module.get<PrismaClient>(PrismaClient);
    expect(prisma).toBeDefined();
  });

  it('should have JwtService provider', () => {
    const jwt = module.get<JwtService>(JwtService);
    expect(jwt).toBeDefined();
  });

  it('should have StorageManagerService provider', () => {
    const storage = module.get<StorageManagerService>(StorageManagerService);
    expect(storage).toBeDefined();
  });
});

describe('UserController', () => {
  let userController: UserController;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;

  beforeEach(async () => {
    userService = {
      parseTypes: jest.fn(),
      findAll: jest.fn(),
      findUserById: jest.fn(),
      updateUser: jest.fn(),
      toggleBanUser: jest.fn(),
      parseRole: jest.fn(),
      changeRole: jest.fn(),
      changeUserImage: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  describe('findAll', () => {
    it('should call parseTypes and findAll, return users', async () => {
      const mockParsedData = {
        where: { name: { contains: 'test' } },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      };
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        surname: 'User',
        password: 'hashedpassword',
        banned: false,
        info: 'some info',
        phone: '1234567890',
        img: 'image.png',
        sex: 'MALE',
        otpCode: 123456,
        otpExpiresAt: new Date(),
        activeStatus: 'Offline',
        roles: ['Admin'],
        created: new Date(),
        groupId: 'group1',
      };

      userService.parseTypes.mockResolvedValue(mockParsedData);
      userService.findAll.mockResolvedValue(mockUser);

      const result = await userController.findAll(
        JSON.stringify(mockParsedData.where),
        JSON.stringify(mockParsedData.orderBy),
        '0',
        '10',
      );

      expect(userService.parseTypes).toHaveBeenCalledWith(
        JSON.stringify(mockParsedData.where),
        JSON.stringify(mockParsedData.orderBy),
        '0',
        '10',
      );
      expect(userService.findAll).toHaveBeenCalledWith(mockParsedData);
      expect(result).toBe(mockUser);
    });

    it('should throw HttpException on parseTypes error', async () => {
      userService.parseTypes.mockImplementation(() => {
        throw new Error('Invalid query');
      });

      await expect(
        userController.findAll('invalid', 'invalid', '0', '10'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('findUserById', () => {
    it('should call findUserById and return user', async () => {
      const mockUser = { id: '1', email: 'a@a.com' } as User;
      userService.findUserById.mockResolvedValue(mockUser);

      const result = await userController.findUserById('1');
      expect(userService.findUserById).toHaveBeenCalledWith('1');
      expect(result).toBe(mockUser);
    });
  });

  describe('updateUserData', () => {
    it('should call updateUser with id and dto', async () => {
      const dto: Prisma.UserUpdateInput = { name: 'new name' };
      const updatedUser = { id: '1', name: 'new name' } as User;

      userService.updateUser.mockResolvedValue(updatedUser);
      const result = await userController.updateUserData('1', dto);

      expect(userService.updateUser).toHaveBeenCalledWith('1', dto);
      expect(result).toBe(updatedUser);
    });
  });

  describe('banUser', () => {
    it('should call toggleBanUser with true', async () => {
      userService.toggleBanUser.mockResolvedValue('User banned');
      const result = await userController.banUser('1');

      expect(userService.toggleBanUser).toHaveBeenCalledWith('1', true);
      expect(result).toBe('User banned');
    });
  });

  describe('unBanUser', () => {
    it('should call toggleBanUser with false', async () => {
      userService.toggleBanUser.mockResolvedValue('User unbanned');
      const result = await userController.unBanUser('1');

      expect(userService.toggleBanUser).toHaveBeenCalledWith('1', false);
      expect(result).toBe('User unbanned');
    });
  });

  describe('changeRole', () => {
    it('should call parseRole and changeRole', async () => {
      const rolesString = 'ADMIN,USER';
      const rolesArray = ['ADMIN', 'USER'];
      userService.parseRole.mockResolvedValue(rolesArray);
      userService.changeRole.mockResolvedValue('Role updated');

      const result = await userController.changeRole('1', rolesString);

      expect(userService.parseRole).toHaveBeenCalledWith(rolesString);
      expect(userService.changeRole).toHaveBeenCalledWith('1', rolesArray);
      expect(result).toBe('Role updated');
    });
  });

  describe('changeUserImage', () => {
    it('should call changeUserImage with buffer and filename', async () => {
      const file = {
        buffer: Buffer.from('image data'),
        originalname: 'image.png',
      } as Express.Multer.File;
      userService.changeUserImage.mockResolvedValue('Image updated');

      const result = await userController.changeUserImage('1', file);

      expect(userService.changeUserImage).toHaveBeenCalledWith(
        '1',
        file.buffer,
        file.originalname,
      );
      expect(result).toBe('Image updated');
    });
  });

  describe('deleteUser', () => {
    it('should call deleteUser with id', async () => {
      userService.deleteUser.mockResolvedValue('User deleted');

      const result = await userController.deleteUser('1');

      expect(userService.deleteUser).toHaveBeenCalledWith('1');
      expect(result).toBe('User deleted');
    });
  });
});
