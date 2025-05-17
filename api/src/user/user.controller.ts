import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User, Prisma, Role, $Enums } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<User[]> {
    try {
      const parsedData = await this.userService.parseTypes(
        where,
        orderBy,
        skip,
        take,
      );
      return this.userService.findAll({
        where: parsedData.where,
        orderBy: parsedData.orderBy,
        skip: parsedData.skip,
        take: parsedData.take,
      });
    } catch (error) {
      throw new HttpException(
        'Invalid query parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  async findUserById(@Param('id') id: string): Promise<User> {
    return this.userService.findUserById(id);
  }

  @Put(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  async updateUserData(
    @Param('id') id: string,
    @Body() updateUserDTO: Prisma.UserUpdateInput,
  ) {
    return this.userService.updateUser(id, updateUserDTO);
  }
  @Put('/ban/:id')
  async banUser(@Param('id') id: string): Promise<String> {
    return this.userService.toggleBanUser(id, true);
  }
  @Put('/unBan/:id')
  async unBanUser(@Param('id') id: string): Promise<String> {
    return this.userService.toggleBanUser(id, false);
  }
  @Put('/changeRole/:id/:role')
  async changeRole(
    @Param('id') id: string,
    @Param('role') roles: string,
  ): Promise<String> {
    const roleArray = await this.userService.parseRole(roles);
    return this.userService.changeRole(id, roleArray);
  }

  @Put('/changeUserImage/:id')
  @UseInterceptors(FileInterceptor('file'))
  async changeUserImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return this.userService.changeUserImage(id, file.buffer, file.originalname);
  }

  @Delete(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
