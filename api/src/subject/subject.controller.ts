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
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Prisma, Subject } from '@prisma/client';
import { ApiBody } from '@nestjs/swagger';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @ApiBody({ type: CreateSubjectDto })
  async createSubject(
    @Body() createSubjectDto: Prisma.SubjectCreateInput,
  ): Promise<Subject> {
    return await this.subjectService.create(createSubjectDto);
  }

  @Get()
  async findAllSubjects(
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<Subject[]> {
    try {
      const parsedData = await this.subjectService.parseTypes(
        where,
        orderBy,
        skip,
        take,
      );
      return this.subjectService.findAllSubjects({
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
  async findOne(@Param('id') id: string): Promise<Subject> {
    return await this.subjectService.findOneSubject(id);
  }

  @Put(':id')
  async updateSubject(
    @Param('id') id: string,
    @Body() updateSubjectDto: Prisma.SubjectUpdateInput,
  ): Promise<Subject> {
    return await this.subjectService.updateSubject(id, updateSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectService.remove(id);
  }
}
