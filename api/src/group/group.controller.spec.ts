import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Group } from '@prisma/client';
import { GroupModule } from './group.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;

  const mockGroup: Group = {
    id: 'group1',
    name: 'Group C',
    status: '',
  };
  describe('GroupModule', () => {
    let module: TestingModule;

    beforeAll(async () => {
      module = await Test.createTestingModule({
        imports: [GroupModule],
      }).compile();
    });

    it('should compile the module', () => {
      expect(module).toBeDefined();
    });

    it('should provide GroupService', () => {
      const service = module.get<GroupService>(GroupService);
      expect(service).toBeInstanceOf(GroupService);
    });

    it('should provide GroupController', () => {
      const controller = module.get<GroupController>(GroupController);
      expect(controller).toBeInstanceOf(GroupController);
    });

    it('should provide PrismaService', () => {
      const prisma = module.get<PrismaService>(PrismaService);
      expect(prisma).toBeInstanceOf(PrismaService);
    });
  });
  const mockGroupService = {
    createGroup: jest.fn().mockResolvedValue(mockGroup),
    findAllGroups: jest.fn().mockResolvedValue([mockGroup]),
    findGroupById: jest.fn().mockResolvedValue(mockGroup),
    parseTypes: jest.fn().mockImplementation((w, o, s, t) => ({
      where: w ? JSON.parse(w) : undefined,
      orderBy: o ? JSON.parse(o) : undefined,
      skip: s ? parseInt(s, 10) : undefined,
      take: t ? parseInt(t, 10) : undefined,
    })),
    findUsersIntoGroup: jest.fn().mockResolvedValue([]),
    updateGroup: jest.fn().mockResolvedValue(mockGroup),
    inviteStudent: jest.fn().mockResolvedValue('Student invited'),
    unInviteStudent: jest.fn().mockResolvedValue('Student uninvited'),
    inviteSubjectForGroup: jest.fn().mockResolvedValue('Subject invited'),
    unInviteSubjectForGroup: jest.fn().mockResolvedValue('Subject uninvited'),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);
    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a group', async () => {
    const dto = { name: 'Group C' };
    const result = await controller.create(dto as any);
    expect(result).toEqual(mockGroup);
    expect(service.createGroup).toHaveBeenCalledWith(dto);
  });

  it('should return all groups with parsed query', async () => {
    const result = await controller.findAllGroups(
      '{"name":"Group C"}',
      '{"name":"asc"}',
      '0',
      '10',
    );
    expect(result).toEqual([mockGroup]);
    expect(service.parseTypes).toHaveBeenCalled();
    expect(service.findAllGroups).toHaveBeenCalled();
  });

  it('should find one group', async () => {
    const result = await controller.findOne('group1');
    expect(result).toEqual(mockGroup);
    expect(service.findGroupById).toHaveBeenCalledWith('group1');
  });

  it('should find users in group', async () => {
    const result = await controller.findUsersInGroup('group1');
    expect(result).toEqual([]);
    expect(service.findUsersIntoGroup).toHaveBeenCalledWith('group1');
  });

  it('should update a group', async () => {
    const dto = { name: 'Updated Group A' };
    const result = await controller.updateGroup('group1', dto);
    expect(result).toEqual(mockGroup);
    expect(service.updateGroup).toHaveBeenCalledWith('group1', dto);
  });

  it('should invite student', async () => {
    const result = await controller.inviteStudent('group1', 'student1');
    expect(result).toBe('Student invited');
    expect(service.inviteStudent).toHaveBeenCalledWith('group1', 'student1');
  });

  it('should uninvite student', async () => {
    const result = await controller.unInviteStudent('group1', 'student1');
    expect(result).toBe('Student uninvited');
    expect(service.unInviteStudent).toHaveBeenCalledWith('group1', 'student1');
  });

  it('should invite subject for multiple groups', async () => {
    const result = await controller.inviteSubjectForGroup(
      'group1,group2',
      'sub1',
    );
    expect(result).toBe('Subject invited');
    expect(service.inviteSubjectForGroup).toHaveBeenCalledWith(
      ['group1', 'group2'],
      'sub1',
    );
  });

  it('should uninvite subject for multiple groups', async () => {
    const result = await controller.unInviteSubjectForGroup(
      'group1,group2',
      'sub1',
    );
    expect(result).toBe('Subject uninvited');
    expect(service.unInviteSubjectForGroup).toHaveBeenCalledWith(
      ['group1', 'group2'],
      'sub1',
    );
  });

  it('should remove a group', async () => {
    await controller.remove('group1');
    expect(service.remove).toHaveBeenCalledWith('group1');
  });
});
