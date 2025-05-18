import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, User, Role, $Enums } from '@prisma/client';
import RegisterDto from 'src/auth/dto/Register.dto';
import * as bcrypt from 'bcryptjs';
import { StorageManagerService } from 'src/storage-manager/storage-manager.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaClient,
    private storageManagerService: StorageManagerService,
  ) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<any> {
    const { skip, take, where, orderBy } = params;

    return this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        Group: true,
      },
    });
  }
  async toggleBanUser(id: string, ban: boolean) {
    try {
      const foundUser = this.findUserById(id);
      if (foundUser) {
        await this.prisma.user.update({
          where: { id: id },
          data: { banned: ban },
        });
      }
      return ban ? 'User has been banned' : 'User has been unbanned';
    } catch (e) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }
  }

  parseTypes(where, orderBy, skip, take) {
    let parsedWhere: Prisma.UserWhereInput | undefined;
    let parsedOrderBy: Prisma.UserOrderByWithRelationInput | undefined;
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

  async findUserById(id: string): Promise<User> {
    const findUser = await this.prisma.user.findFirst({
      where: { id: id },
      include: { Comment: true },
    });
    if (!findUser) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return findUser;
  }

  async createNewUser(userData: RegisterDto, file: Buffer, fileName: string) {
    const { email } = userData;
    try {
      const exitUser = await this.prisma.user.findFirst({
        where: { email: email },
      });
      if (exitUser) {
        throw new HttpException('This user is exist', HttpStatus.BAD_REQUEST);
      }
      const image = await this.storageManagerService.uploadPublicFile(
        file,
        fileName,
      );
      userData.img = image.Location;
      userData.password = await this.hashedPassword(userData.password);
      const newUser = await this.prisma.user.create({
        data: userData,
      });
      return newUser;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async changeUserImage(
    id: string,
    file: Buffer,
    fileName: string,
  ): Promise<string> {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    const newImage = await this.storageManagerService.uploadPublicFile(
      file,
      fileName,
    );

    await this.prisma.user.update({
      where: { id },
      data: { img: newImage.Location },
    });

    return newImage.Location;
  }
  async hashedPassword(password): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }

  async updateUser(
    id: string,
    updateUserDto: Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      const updateUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      return updateUser;
    } catch (e) {
      console.log(e);
    }
  }

  async deleteUser(id: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id: id },
      });
      return deletedUser;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async changeRole(id: string, roleArray: $Enums.Role[]) {
    try {
      const changeRole = await this.prisma.user.update({
        where: { id },
        data: {
          roles: roleArray,
        },
      });
      console.log(changeRole);
      return 'User roles updated successfully';
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Error updating user roles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async parseRole(roles: string): Promise<$Enums.Role[]> {
    const roleArray = roles.split(',').map((role) => {
      switch (role.trim().toLowerCase()) {
        case 'admin':
          return $Enums.Role.Admin;
        case 'student':
          return $Enums.Role.Student;
        case 'teacher':
          return $Enums.Role.Teacher;
        case 'parent':
          return $Enums.Role.Parent;

        default:
          throw new HttpException('Invalid role', HttpStatus.BAD_REQUEST);
      }
    });
    return roleArray;
  }
}
