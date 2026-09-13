import { VehicleMake } from '../entities/vehicle-make.entity';
import { VehicleColor } from '../enums/vehicle-color.enum';
import { CritAir } from '../enums/crit-air.enum';
import { Transmission } from '../enums/transmission.enum';
import { Drivetrain } from '../enums/drivetrain.enum';
import { FuelType } from '../enums/fuel-type.enum';

export interface VinLookupResult {
  recognized: boolean;
  wmi: string;
  make: VehicleMake | null;
  modelYear?: number;
}

export interface CreateVehicleInput {
  makeId: number;
  modelId: number;
  trimId?: number;
  vin?: string;
  year: number;
  exteriorColor?: VehicleColor;
  interiorColor?: VehicleColor;
  mileage?: number;
  numberOfOwners?: number;
  plateCountry?: string;
  fiscalPower: number;
  critAir?: CritAir;
  numberOfSeats?: number;
  numberOfDoors?: number;
  engine?: string;
  displacement?: number;
  horsepower?: number;
  torque?: number;
  transmission?: Transmission;
  drivetrain?: Drivetrain;
  fuelType?: FuelType;
  weight?: number;
}
