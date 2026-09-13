import { UserRole } from '../enums/user-role.enum';

export interface RegisteredUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AccessToken {
  accessToken: string;
}
