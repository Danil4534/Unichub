import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import { GroupService } from './group.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { Group, Prisma, PrismaClient } from '@prisma/client';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiBody({ type: CreateGroupDto })
  async create(
    @Body() createGroupDto: Prisma.GroupCreateInput,
  ): Promise<Group> {
    return await this.groupService.createGroup(createGroupDto);
  }

  @Get()
  async findAllGroups(
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<Group[]> {
    try {
      const parsedData = await this.groupService.parseTypes(
        where,
        orderBy,
        skip,
        take,
      );
      return this.groupService.findAllGroups({
        where: parsedData.where,
        orderBy: parsedData.orderBy,
        skip: parsedData.skip,
        take: parsedData.take,
      });
    } catch (e) {
      throw new HttpException(
        'Invalid query parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Get('getStudentsFromGroup/:groupId')
  async findUsersInGroup(@Param('groupId') groupId: string) {
    return await this.groupService.findUsersIntoGroup(groupId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.groupService.findGroupById(id);
  }

  @Put(':id')
  @ApiBody({
    type: UpdateGroupDto,
    description: 'Update group data',
  })
  async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return await this.groupService.updateGroup(id, updateGroupDto);
  }

  @Put('/:groupId/inviteStudent/:studentId')
  async inviteStudent(
    @Param('groupId') groupId: string,
    @Param('studentId') studentId: string,
  ): Promise<String> {
    return await this.groupService.inviteStudent(groupId, studentId);
  }

  @Put('/:groupId/unInviteStudent/:studentId')
  async unInviteStudent(
    @Param('groupId') groupId: string,
    @Param('studentId') studentId: string,
  ): Promise<String> {
    return await this.groupService.unInviteStudent(groupId, studentId);
  }

  @Put(':groupIds/inviteSubjectForGroup/:subId')
  async inviteSubjectForGroup(
    @Param('groupIds') groupIds: string,
    @Param('subId') subId: string,
  ): Promise<String> {
    const groupIdsArray = groupIds.split(',');
    return await this.groupService.inviteSubjectForGroup(groupIdsArray, subId);
  }

  @Put(':groupIds/unInviteSubjectForGroup/:subId')
  async unInviteSubjectForGroup(
    @Param('groupIds') groupIds: string,
    @Param('subId') subId: string,
  ): Promise<String> {
    const groupIdsArray = groupIds.split(',');
    return await this.groupService.unInviteSubjectForGroup(
      groupIdsArray,
      subId,
    );
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}
