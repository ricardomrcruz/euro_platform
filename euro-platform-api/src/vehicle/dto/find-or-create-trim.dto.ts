import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class FindOrCreateTrimDto {
  @IsInt()
  @IsPositive()
  modelId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  // A finition/trim name isn't tied to one specific model-year (see vehicle-trim.entity.ts) --
  // year is optional context, not a required disambiguator.
  @IsOptional()
  @IsInt()
  @Min(1886)
  year?: number;
}
