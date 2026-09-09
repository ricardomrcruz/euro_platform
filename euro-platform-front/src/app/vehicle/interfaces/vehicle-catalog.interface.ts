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
}

// One fuel-type engine variant of a finition -- the same finition name commonly ships with
// several distinct engines (e.g. "GT Line" petrol vs. diesel vs. hybrid), each with its own
// output figures.
export interface VehicleTrimPowertrain {
  id: number;
  fuelType: FuelType;
  engine?: string;
  displacement?: number;
  horsepower?: number;
  torque?: number;
  transmission?: Transmission;
  drivetrain?: Drivetrain;
  weight?: number;
}

export interface VehicleTrim {
  id: number;
  name: string;
  powertrains: VehicleTrimPowertrain[];
}

export interface VinLookupResult {
  recognized: boolean;
  wmi: string;
  make: VehicleMake | null;
  modelYear?: number;
}
