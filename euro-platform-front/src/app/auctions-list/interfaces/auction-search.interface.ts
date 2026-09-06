import type { VehicleCondition } from '../../ad/interfaces/ad.interface';
import type {
  BodyType,
  Drivetrain,
  FuelType,
  Transmission,
  VehicleColor,
} from '../../vehicle/interfaces/vehicle-catalog.interface';

export interface AuctionSearchFilters {
  q?: string;
  make?: string;
  model?: string;
  trim?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  horsepowerMin?: number;
  horsepowerMax?: number;
  fiscalPowerMin?: number;
  fiscalPowerMax?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  drivetrain?: Drivetrain;
  bodyType?: BodyType;
  color?: VehicleColor;
  condition?: VehicleCondition;
  numberOfDoors?: number;
  numberOfSeats?: number;
}
