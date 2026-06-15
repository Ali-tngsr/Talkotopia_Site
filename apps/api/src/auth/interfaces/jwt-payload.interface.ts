import { Role } from '../../users/role.enum';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}
