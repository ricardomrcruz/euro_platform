import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  // Issues a long-lived token instead of the usual short session length.
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}