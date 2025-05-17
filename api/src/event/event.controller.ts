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
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { Prisma, Event } from '@prisma/client';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiBody({ type: CreateEventDto })
  create(@Body() createEventDto: Prisma.EventCreateInput) {
    return this.eventService.createEvent(createEventDto);
  }

  @Get()
  async findAllEvents(
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<Event[]> {
    try {
      const parsedData = await this.eventService.parseTypes(
        where,
        orderBy,
        skip,
        take,
      );
      return this.eventService.findAllEvents({
        where: parsedData.where,
        orderBy: parsedData.orderBy,
        skip: parsedData.skip,
        take: parsedData.take,
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOneEvent(@Param('id') id: string) {
    return await this.eventService.findOneEvent(id);
  }
  @Get('getEventsForGroup/:groupId')
  async findEventsForGroup(@Param('groupId') id: string) {
    return await this.eventService.findEventsForGroup(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return await this.eventService.updateEvent(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
