import { Lesson } from './../lesson/entities/lesson.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Group } from './entities/group.entity';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async createGroup(createGroupDto: Prisma.GroupCreateInput) {
    try {
      const existGroup = await this.prisma.group.findFirst({
        where: { name: createGroupDto.name },
      });
      if (existGroup) {
        throw new HttpException(
          'The group with this name already exists',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const newGroup = await this.prisma.group.create({
        data: createGroupDto,
      });
      return newGroup;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUsersIntoGroup(groupId: string) {
    return await this.prisma.group.findFirst({
      where: { id: groupId },
      include: { students: true },
    });
  }
  async findAllGroups(params: {
    skip?: number;
    take?: number;
    where?: Prisma.GroupWhereInput;
    orderBy?: Prisma.GroupOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.group.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { students: true, subjects: true },
    });
  }

  async findGroupById(id: string): Promise<Group> {
    try {
      const group = await this.prisma.group.findFirst({ where: { id: id } });
      return group;
    } catch (e) {
      throw new HttpException('Invalid group', HttpStatus.BAD_REQUEST);
    }
  }

  async updateGroup(id: string, updateGroupDto: Prisma.GroupUpdateInput) {
    try {
      const updateGroup = await this.prisma.group.update({
        where: { id },
        data: updateGroupDto,
      });
      return updateGroup;
    } catch (e) {
      console.log(e);
    }
  }

  async remove(id: string) {
    try {
      const deleteGroup = await this.prisma.group.findFirst({
        where: { id: id },
      });
      if (deleteGroup) {
        await this.prisma.group.delete({ where: { id: id } });
      }
    } catch (e) {
      throw new HttpException(
        'Error with deleting this group',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  parseTypes(where, orderBy, skip, take) {
    let parsedWhere: Prisma.GroupWhereInput | undefined;
    let parsedOrderBy: Prisma.GroupOrderByWithRelationInput | undefined;
    let parsedSkip: number | undefined;
    let parsedTake: number | undefined;

    parsedWhere = where ? JSON.parse(where) : undefined;
    parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    parsedSkip = skip ? parseInt(skip, 10) : 0;
    parsedTake = take ? parseInt(take, 10) : undefined;

    let parsedData = {
      where: parsedWhere,
      orderBy: parsedOrderBy,
      skip: parsedSkip,
      take: parsedTake,
    };

    return parsedData;
  }

  async inviteStudent(groupId: string, studentId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new HttpException('Group is not found', HttpStatus.BAD_REQUEST);
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new HttpException('Student is not found', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.user.update({
      where: { id: studentId },
      data: { groupId: groupId },
    });
    return 'Student successfully added to the group';
  }

  async unInviteStudent(groupId: string, studentId: string): Promise<string> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new HttpException('Group is not found', HttpStatus.BAD_REQUEST);
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new HttpException('Student is not found', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.user.update({
      where: { id: studentId },
      data: { groupId: null },
    });
    return 'Student successfully deleted from the group';
  }

  async inviteSubjectForGroup(
    groupIds: string[],
    subjectId: string,
  ): Promise<string> {
    await Promise.all(
      groupIds.map(async (groupId) => {
        await this.prisma.group.update({
          where: { id: groupId },
          data: {
            subjects: {
              connect: { id: subjectId },
            },
          },
        });
      }),
    );

    return 'Subject was successfully added to each group';
  }
  async unInviteSubjectForGroup(
    groupIds: string[],
    subjectId: string,
  ): Promise<string> {
    try {
      await Promise.all(
        groupIds.map((groupId) =>
          this.prisma.group.update({
            where: { id: groupId },
            data: {
              subjects: {
                disconnect: { id: subjectId },
              },
            },
          }),
        ),
      );

      return 'Subject was successfully removed from each group';
    } catch (error) {
      console.error('Error uninviting subject from groups:', error);
      throw new Error('Failed to remove subject from one or more groups');
    }
  }
}
