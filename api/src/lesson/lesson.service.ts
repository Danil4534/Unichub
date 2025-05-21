import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventService } from 'src/event/event.service';
import { CreateEventDto } from 'src/event/dto/create-event.dto';

@Injectable()
export class LessonService {
  constructor(
    private prisma: PrismaService,
    private eventService: EventService,
  ) {}

  async findOneLesson(id: string): Promise<Lesson> {
    try {
      const lesson = await this.prisma.lesson.findFirst({ where: { id: id } });
      return lesson;
    } catch (e) {
      throw new HttpException('Invalid found lesson', HttpStatus.BAD_REQUEST);
    }
  }

  parseTypes(where, orderBy, skip, take) {
    let parsedWhere: Prisma.LessonWhereInput | undefined;
    let parsedOrderBy: Prisma.LessonOrderByWithRelationInput | undefined;
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

  async findAllLessons(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LessonWhereInput;
    orderBy?: Prisma.LessonOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;

    return this.prisma.lesson.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { tasks: true, subject: true },
    });
  }
  async create(createLessonDto: Prisma.LessonCreateInput, groupIds: string[]) {
    try {
      const newLesson = await this.prisma.lesson.create({
        data: createLessonDto,
      });

      const eventPromises = groupIds.map(async (groupId) => {
        const newEvent = {
          title: newLesson.title,
          description: newLesson.description,
          start: newLesson.startTime,
          end: newLesson.endTime,
          created: newLesson.created,
          status: 'New',
          groupId: groupId,
        };
        // return await this.eventService.createEvent(newEvent);
      });
      await Promise.all(eventPromises);
      return newLesson;
    } catch (e) {
      console.error('Error creating lesson or events:', e);
      throw new HttpException(
        'Failed to create lesson and associated events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateLesson(id: string, updateLessonDto: Prisma.LessonUpdateInput) {
    try {
      const updateLesson = await this.prisma.lesson.update({
        where: { id },
        data: updateLessonDto,
      });

      return updateLesson;
    } catch (e) {
      throw new HttpException(
        'Error with update Lesson data',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeLesson(id: string): Promise<string> {
    try {
      const deleteLesson = await this.prisma.lesson.findFirst({
        where: { id },
      });
      if (deleteLesson) {
        await this.prisma.lesson.delete({ where: { id } });
      }
      return 'Delete was successful';
    } catch (e) {
      throw new HttpException(
        'Error with deleting this lesson',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeAllLessonIntoSubject(subId: string) {
    try {
      const deletedLessons = await this.prisma.lesson.deleteMany({
        where: { subjectId: subId },
      });
      return deletedLessons;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
}
