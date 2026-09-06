export type BodyType =
  | 'SEDAN'
  | 'HATCHBACK'
  | 'WAGON'
  | 'COUPE'
  | 'CONVERTIBLE'
  | 'SUV'
  | 'CROSSOVER'
  | 'MINIVAN'
  | 'PICKUP'
  | 'VAN';

export type FuelType =
  | 'GASOLINE'
  | 'DIESEL'
  | 'ELECTRIC'
  | 'HYBRID'
  | 'PLUGIN_HYBRID'
  | 'LPG'
  | 'ETHANOL'
  | 'HYDROGEN'
  | 'CNG';

export type Transmission = 'MANUAL' | 'AUTOMATIC' | 'CVT' | 'SEMI_AUTOMATIC';

export type Drivetrain = 'FWD' | 'RWD' | 'AWD' | 'FOUR_WD';

export type VehicleColor =
  | 'SILVER'
  | 'BEIGE'
  | 'WHITE'
  | 'BLUE'
  | 'BURGUNDY'
  | 'GOLD'
  | 'GREY'
  | 'IVORY'
  | 'YELLOW'
  | 'BROWN'
  | 'BLACK'
  | 'ORANGE'
  | 'PINK'
  | 'RED'
  | 'GREEN'
  | 'PURPLE'
  | 'OTHER';

export interface VehicleMake {
  id: number;
  name: string;
  country?: string;
  logoUrl?: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  bodyType?: BodyType;
  yearStart?: number;
  yearEnd?: number;
}

export interface VehicleTrim {
  id: number;
  name: string;
  engine?: string;
  horsepower?: number;
  transmission?: Transmission;
  drivetrain?: Drivetrain;
  fuelType?: FuelType;
  year?: number;
}

export interface VinLookupResult {
  recognized: boolean;
  wmi: string;
  make: VehicleMake | null;
  modelYear?: number;
}
