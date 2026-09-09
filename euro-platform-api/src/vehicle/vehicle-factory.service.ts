import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepository } from './vehicle.repository';
import { VehicleMake } from './entities/vehicle-make.entity';
import { VehicleTrim } from './entities/vehicle-trim.entity';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleColor } from './enums/vehicle-color.enum';
import { CritAir } from './enums/crit-air.enum';
import { Transmission } from './enums/transmission.enum';
import { Drivetrain } from './enums/drivetrain.enum';
import { FuelType } from './enums/fuel-type.enum';
import { decodeModelYear } from './vin-year.util';

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

// The design doc's Factory pattern for 6.2.1 "Creer une annonce": queries the catalog.
// Backed by our own locally-seeded tables (see src/vehicle/seed/seed-catalog.ts), not a
// live external API -- CarAPI's 2015-2020-only free tier and NHTSA's US-market bias both
// don't fit a European collectible-car platform.
@Injectable()
export class VehicleFactoryService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  listMakes(): Promise<VehicleMake[]> {
    return this.vehicleRepository.listMakes();
  }

  listModels(make: string) {
    return this.vehicleRepository.listModelsByMakeName(make);
  }

  listTrims(make: string, model: string): Promise<VehicleTrim[]> {
    return this.vehicleRepository.listTrimsByMakeModel(make, model);
  }

  resolveTrim(id: number): Promise<VehicleTrim | null> {
    return this.vehicleRepository.findTrimByIdWithMakeModel(id);
  }

  findOrCreateMake(name: string): Promise<VehicleMake> {
    return this.vehicleRepository.findOrCreateMakeByName(name);
  }

  findOrCreateModel(makeId: number, name: string) {
    return this.vehicleRepository.findOrCreateModelByName(makeId, name);
  }

  findOrCreateTrim(modelId: number, name: string, fuelType?: FuelType): Promise<VehicleTrim> {
    return this.vehicleRepository.findOrCreateTrimByName(modelId, name, fuelType);
  }

  // Best-effort VIN recognition (design doc 6.2.1.1 "VIN reconnu" -- a separate scenario
  // from 6.2.1.2 "limite atteinte", which is the active-ad cap enforced in AdService, not a
  // VIN fallback). Only the WMI (first 3 chars -> manufacturer) and the model-year code are
  // actually decodable from data we have -- the rest of a VIN is manufacturer-proprietary
  // encoding we don't have access to. "Recognized" here means "we identified the make";
  // the caller still needs to pick model/trim from the catalog, same as any other listing.
  async resolveByVin(vin: string): Promise<VinLookupResult> {
    const wmi = vin.slice(0, 3).toUpperCase();
    const make = await this.vehicleRepository.findMakeByWmi(wmi);

    return {
      recognized: !!make,
      wmi,
      make,
      modelYear: decodeModelYear(vin),
    };
  }

  // Called by AdService when creating an ad (design doc 6.2.1: the Factory service is what
  // actually creates the Vehicle row, not AdModule directly).
  async createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
    const make = await this.vehicleRepository.findMakeById(input.makeId);
    if (!make) {
      throw new NotFoundException('Vehicle make not found');
    }

    const model = await this.vehicleRepository.findModelById(input.modelId);
    if (!model) {
      throw new NotFoundException('Vehicle model not found');
    }

    let trim: VehicleTrim | undefined;
    if (input.trimId) {
      const found = await this.vehicleRepository.findTrimById(input.trimId);
      if (!found) {
        throw new NotFoundException('Vehicle trim not found');
      }
      trim = found;
    }

    return this.vehicleRepository.saveVehicle(
      this.vehicleRepository.createVehicle({
        make,
        model,
        trim,
        vin: input.vin,
        year: input.year,
        exteriorColor: input.exteriorColor,
        interiorColor: input.interiorColor,
        mileage: input.mileage,
        numberOfOwners: input.numberOfOwners,
        plateCountry: input.plateCountry,
        fiscalPower: input.fiscalPower,
        critAir: input.critAir,
        numberOfSeats: input.numberOfSeats,
        numberOfDoors: input.numberOfDoors,
        engine: input.engine,
        displacement: input.displacement,
        horsepower: input.horsepower,
        torque: input.torque,
        transmission: input.transmission,
        drivetrain: input.drivetrain,
        fuelType: input.fuelType,
        weight: input.weight,
      }),
    );
  }
}
