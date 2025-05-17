import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// Define a Role decorator to set roles metadata
export const RoleDecorator = (...roles: Role[]) => SetMetadata('roles', roles);
