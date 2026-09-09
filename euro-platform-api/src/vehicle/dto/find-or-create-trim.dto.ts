import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { FuelType } from '../enums/fuel-type.enum';

export class FindOrCreateTrimDto {
  @IsInt()
  @IsPositive()
  modelId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  // The fuel type the seller is building the ad with -- lets this find-or-create also
  // resolve the right VehicleTrimPowertrain row for a brand-new finition name.
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;
}
