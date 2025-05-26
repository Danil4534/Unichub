import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Subject } from '@prisma/client';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(createSubjectDto: Prisma.SubjectCreateInput) {
    try {
      const existSubject = await this.prisma.subject.findFirst({
        where: { name: createSubjectDto.name },
      });
      if (existSubject) {
        throw new HttpException(
          'The subject with this name already exists',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return await this.prisma.subject.create({
        data: createSubjectDto,
      });
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllSubjects(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SubjectWhereInput;
    orderBy?: Prisma.SubjectOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;

    return this.prisma.subject.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        lessons: true,
        tasks: true,
        groups: {
          include: { students: true },
        },
      },
    });
  }

  async findOneSubject(id: string): Promise<Subject> {
    try {
      const subject = this.prisma.subject.findFirst({
        where: { id: id },
        include: { tasks: true, lessons: true, groups: true },
      });
      return subject;
    } catch (e) {
      throw new HttpException('Invalid subject', HttpStatus.BAD_REQUEST);
    }
  }

  async updateSubject(id: string, updateSubjectDto: Prisma.SubjectUpdateInput) {
    try {
      const updateSubject = await this.prisma.subject.update({
        where: { id },
        data: updateSubjectDto,
      });
      return updateSubject;
    } catch (e) {
      console.log(e);
    }
  }

  async remove(id: string) {
    try {
      const deleteSubject = await this.prisma.subject.findFirst({
        where: { id: id },
      });
      if (deleteSubject) {
        await this.prisma.subject.delete({ where: { id: id } });
      }
    } catch (e) {
      throw new HttpException(
        'Error with deleting this subject',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  parseTypes(where, orderBy, skip, take) {
    let parsedWhere: Prisma.SubjectWhereInput | undefined;
    let parsedOrderBy: Prisma.SubjectOrderByWithRelationInput | undefined;
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
}
