import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles) {
      true;
    }
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['accessToken'];
    if (!token) {
      return false;
    }

    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.id;
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return false;
      }
      return user.roles.some((role) => roles.includes(role));
    } catch (e) {
      return false;
    }
  }
}
