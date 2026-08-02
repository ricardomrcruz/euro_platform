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

  // Vehicle selection -- creates the underlying Vehicle row via VehicleFactoryService in
  // the same request (design doc 6.2.1: Ad creation is what invokes the Factory).
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
  @IsString()
  exteriorColor?: string;

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
}
