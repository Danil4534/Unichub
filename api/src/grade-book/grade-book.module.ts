import { Module } from '@nestjs/common';
import { GradeBookService } from './grade-book.service';
import { GradeBookController } from './grade-book.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [GradeBookController],
  providers: [GradeBookService, PrismaService],
})
export class GradeBookModule {}
