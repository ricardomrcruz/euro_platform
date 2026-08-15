import { UserRole } from '../../user/enums/user-role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tokenVersion: number;
}
