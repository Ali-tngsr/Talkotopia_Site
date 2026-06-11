import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/role.enum';

export const RequireRoles = (...roles: Role[]) => SetMetadata('roles', roles);
