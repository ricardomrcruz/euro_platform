import { BodyType } from './enums/body-type.enum';
import { Transmission } from './enums/transmission.enum';
import { Drivetrain } from './enums/drivetrain.enum';
import { FuelType } from './enums/fuel-type.enum';

// Free-text -> enum normalizers shared by anything that ingests external catalog data
// (the dormant CarAPI client, the Wikidata seed script) -- external sources describe these
// as prose ("front wheel drive", "sports car"), never as our exact enum values.

export function mapBodyType(value?: string): BodyType | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('sedan')) return BodyType.SEDAN;
  if (normalized.includes('hatchback')) return BodyType.HATCHBACK;
  if (normalized.includes('wagon') || normalized.includes('estate')) return BodyType.WAGON;
  if (normalized.includes('coupe')) return BodyType.COUPE;
  if (normalized.includes('convertible') || normalized.includes('cabriolet') || normalized.includes('roadster')) {
    return BodyType.CONVERTIBLE;
  }
  if (normalized.includes('crossover')) return BodyType.CROSSOVER;
  if (normalized.includes('suv')) return BodyType.SUV;
  if (normalized.includes('minivan') || normalized.includes('mpv') || normalized.includes('van')) {
    return BodyType.MINIVAN;
  }
  if (normalized.includes('pickup') || normalized.includes('truck')) return BodyType.PICKUP;
  return undefined;
}

export function mapTransmission(value?: string): Transmission | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('manual')) return Transmission.MANUAL;
  if (normalized.includes('cvt')) return Transmission.CVT;
  if (
    normalized.includes('dual clutch') ||
    normalized.includes('dct') ||
    normalized.includes('semi')
  ) {
    return Transmission.SEMI_AUTOMATIC;
  }
  if (normalized.includes('automatic')) return Transmission.AUTOMATIC;
  return undefined;
}

export function mapDrivetrain(value?: string): Drivetrain | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('four') || normalized.includes('4wd') || normalized.includes('4x4')) {
    return Drivetrain.FOUR_WD;
  }
  if (normalized.includes('all') || normalized.includes('awd')) return Drivetrain.AWD;
  if (normalized.includes('front')) return Drivetrain.FWD;
  if (normalized.includes('rear')) return Drivetrain.RWD;
  return undefined;
}

export function mapFuelType(value?: string): FuelType | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('plug')) return FuelType.PLUGIN_HYBRID;
  if (normalized.includes('hybrid')) return FuelType.HYBRID;
  if (normalized.includes('electric')) return FuelType.ELECTRIC;
  if (normalized.includes('diesel')) return FuelType.DIESEL;
  if (normalized.includes('lpg') || normalized.includes('propane')) return FuelType.LPG;
  if (normalized.includes('e85') || normalized.includes('ethanol')) return FuelType.ETHANOL;
  if (normalized.includes('gas') || normalized.includes('petrol')) return FuelType.GASOLINE;
  return undefined;
}
