import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { VehicleCondition } from '../../ad/enums/vehicle-condition.enum';
import { VehicleColor } from '../../vehicle/enums/vehicle-color.enum';
import { FuelType } from '../../vehicle/enums/fuel-type.enum';
import { Transmission } from '../../vehicle/enums/transmission.enum';
import { Drivetrain } from '../../vehicle/enums/drivetrain.enum';
import { BodyType } from '../../vehicle/enums/body-type.enum';

export class SearchAuctionsDto {
  // %LIKE against the ad title or description.
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  trim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1886)
  yearMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1886)
  yearMax?: number;

  // Against each auction's effective current price (currentHighestBid, falling back to
  // reservePrice for auctions with no bids yet).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileageMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileageMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  horsepowerMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  horsepowerMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fiscalPowerMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fiscalPowerMax?: number;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @IsOptional()
  @IsEnum(Drivetrain)
  drivetrain?: Drivetrain;

  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @IsOptional()
  @IsEnum(VehicleColor)
  color?: VehicleColor;

  @IsOptional()
  @IsEnum(VehicleCondition)
  condition?: VehicleCondition;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numberOfDoors?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numberOfSeats?: number;
}
