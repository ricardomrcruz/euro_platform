import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class FindOrCreateTrimDto {
  @IsInt()
  @IsPositive()
  modelId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  // VehicleTrim.year is a non-nullable column -- the ad's own year field is the natural source
  // for this when the trim doesn't exist yet.
  @IsInt()
  @Min(1886)
  year!: number;
}
