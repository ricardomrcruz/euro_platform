import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class FindOrCreateModelDto {
  @IsInt()
  @IsPositive()
  makeId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
