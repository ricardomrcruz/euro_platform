import { UserRole } from '../../user/enums/user-role.enum';

export class ValidatedUserDto {
  id!: number;
  email!: string;
  role!: UserRole;
}
