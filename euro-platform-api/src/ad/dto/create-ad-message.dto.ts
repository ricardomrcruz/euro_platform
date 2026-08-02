import { IsString, MinLength } from 'class-validator';

export class CreateAdMessageDto {
  @IsString()
  @MinLength(1)
  message!: string;
}
