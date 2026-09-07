import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

// Mirrors euro-auth's LoginDto, per the existing no-cross-service-coupling decision.
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
