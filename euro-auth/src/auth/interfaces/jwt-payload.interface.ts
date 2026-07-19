import { UserRole } from '../../user/enums/user-role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  tokenVersion: number;
}
