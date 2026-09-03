export interface VehicleMake {
  id: number;
  name: string;
  country?: string;
  logoUrl?: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  bodyType?: string;
  yearStart?: number;
  yearEnd?: number;
}

export interface VehicleTrim {
  id: number;
  name: string;
  engine?: string;
  horsepower?: number;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  year?: number;
}

export interface VinLookupResult {
  recognized: boolean;
  wmi: string;
  make: VehicleMake | null;
  modelYear?: number;
}
