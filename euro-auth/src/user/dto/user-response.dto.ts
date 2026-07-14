import { UserRole } from "../enums/user-role.enum";

export class UserResponseDto {
  id!: number;
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: UserRole;
}