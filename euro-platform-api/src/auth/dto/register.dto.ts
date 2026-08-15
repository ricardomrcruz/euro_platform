import { IsEmail, IsString, MinLength } from 'class-validator';

// Mirrors euro-auth's CreateUserDto, per the existing no-cross-service-coupling decision.
// Required (not just style): the global ValidationPipe here runs with forbidNonWhitelisted,
// so a passthrough with no matching DTO would reject every request.
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;
}
