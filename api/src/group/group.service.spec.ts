import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException } from '@nestjs/common';

describe('GroupService', () => {
  let service: GroupService;
  let prisma: PrismaService;

  const mockPrismaService = {
    group: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a new group', async () => {
      mockPrismaService.group.findFirst.mockResolvedValue(null);
      mockPrismaService.group.create.mockResolvedValue({
        id: '1',
        name: 'Group C',
      });

      const result = await service.createGroup({ name: 'Group C' } as any);
      expect(result).toEqual({ id: '1', name: 'Group C' });
    });

    it('should throw exception if group exists', async () => {
      mockPrismaService.group.findFirst.mockResolvedValue({ name: 'Group C' });
    });
  });

  describe('findUsersIntoGroup', () => {
    it('should return group with students', async () => {
      const groupId = 'group-123';
      const expected = { id: groupId, students: [] };
      mockPrismaService.group.findFirst.mockResolvedValue(expected);

      const result = await service.findUsersIntoGroup(groupId);
      expect(result).toEqual(expected);
    });
  });

  describe('inviteStudent', () => {
    it('should invite student to group', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '2' });
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.inviteStudent('1', '2');
      expect(result).toBe('Student successfully added to the group');
    });

    it('should throw if group not found', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(null);

      await expect(service.inviteStudent('1', '2')).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if student not found', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.inviteStudent('1', '2')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('unInviteStudent', () => {
    it('should remove student from group', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '2' });
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.unInviteStudent('1', '2');
      expect(result).toBe('Student successfully deleted from the group');
    });
  });

  describe('inviteSubjectForGroup', () => {
    it('should invite subject for multiple groups', async () => {
      mockPrismaService.group.update.mockResolvedValue({});

      const result = await service.inviteSubjectForGroup(
        ['1', '2'],
        'subject-1',
      );
      expect(result).toBe('Subject was successfully added to each group');
    });
  });

  describe('unInviteSubjectForGroup', () => {
    it('should remove subject from multiple groups', async () => {
      mockPrismaService.group.update.mockResolvedValue({});

      const result = await service.unInviteSubjectForGroup(
        ['1', '2'],
        'subject-1',
      );
      expect(result).toBe('Subject was successfully removed from each group');
    });
  });

  describe('findAllGroups', () => {
    it('should return list of groups', async () => {
      const groups = [{ id: '1', students: [], subjects: [] }];
      mockPrismaService.group.findMany.mockResolvedValue(groups);

      const result = await service.findAllGroups({});
      expect(result).toEqual(groups);
    });
  });

  describe('remove', () => {
    it('should delete the group', async () => {
      mockPrismaService.group.findFirst.mockResolvedValue({ id: '1' });
      mockPrismaService.group.delete.mockResolvedValue({});

      await expect(service.remove('1')).resolves.not.toThrow();
    });

    it('should throw error if deletion fails', async () => {
      mockPrismaService.group.findFirst.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).resolves.not.toThrow();
    });
  });
});
afterEach(() => {
  jest.clearAllMocks();
});
