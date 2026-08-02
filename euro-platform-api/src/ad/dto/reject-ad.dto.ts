import { IsString, MinLength } from 'class-validator';

export class RejectAdDto {
  @IsString()
  @MinLength(1)
  message!: string;
}
