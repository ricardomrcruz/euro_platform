import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { VehicleCondition } from '../enums/vehicle-condition.enum';
import { VehicleColor } from '../../vehicle/enums/vehicle-color.enum';
import { CritAir } from '../../vehicle/enums/crit-air.enum';

export class CreateAdDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(VehicleCondition)
  condition!: VehicleCondition;

  @IsOptional()
  @IsString()
  highlights?: string;

  @IsOptional()
  @IsString()
  knownFlaws?: string;

  @IsOptional()
  @IsString()
  modifications?: string;

  @IsOptional()
  @IsString()
  serviceHistory?: string;

  @IsOptional()
  @IsString()
  location?: string;

  // Vehicle fields create the underlying Vehicle row via VehicleFactoryService.
  @IsInt()
  @IsPositive()
  makeId!: number;

  @IsInt()
  @IsPositive()
  modelId!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  trimId?: number;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsInt()
  @Min(1886)
  year!: number;

  @IsOptional()
  @IsEnum(VehicleColor)
  exteriorColor?: VehicleColor;

  @IsOptional()
  @IsString()
  interiorColor?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfOwners?: number;

  @IsOptional()
  @IsString()
  plateCountry?: string;

  // French administrative tax rating (cv).
  @IsInt()
  @Min(1)
  fiscalPower!: number;

  @IsOptional()
  @IsEnum(CritAir)
  critAir?: CritAir;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfSeats?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfDoors?: number;
}
