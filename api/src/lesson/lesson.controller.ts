import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson, Prisma } from '@prisma/client';
import { ApiBody } from '@nestjs/swagger';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { RoleGuard } from 'src/auth/guard/RoleGuard';

@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post(':groupIds')
  @ApiBody({ type: CreateLessonDto })
  async create(
    @Body() createLessonDto: Prisma.LessonCreateInput,
    @Param('groupIds') groupIds: string,
  ): Promise<Lesson> {
    const groupIdsArray = groupIds.split(',');
    return await this.lessonService.create(createLessonDto, groupIdsArray);
  }
  // @UseGuards(RoleGuard)
  // @RoleDecorator('Admin')
  @Get()
  async findAllLessons(
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<Lesson[]> {
    try {
      const parsedData = await this.lessonService.parseTypes(
        where,
        orderBy,
        skip,
        take,
      );
      return this.lessonService.findAllLessons({
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

  @Get(':id')
  async findOneLesson(@Param('id') id: string) {
    return await this.lessonService.findOneLesson(id);
  }

  @Put(':id')
  async updateLesson(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonService.updateLesson(id, updateLessonDto);
  }

  @Delete('/deleteAllLessonsIntoSubject/:subId')
  async deleteAllLessonsIntoSubject(@Param('subId') subId: string) {
    return await this.lessonService.removeAllLessonIntoSubject(subId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<string> {
    return this.lessonService.removeLesson(id);
  }
}
