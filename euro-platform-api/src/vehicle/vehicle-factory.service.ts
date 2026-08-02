import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleMake } from './entities/vehicle-make.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleTrim } from './entities/vehicle-trim.entity';
import { Vehicle } from './entities/vehicle.entity';
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
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  numberOfOwners?: number;
  plateCountry?: string;
}

// The design doc's Factory pattern for 6.2.1 "Creer une annonce": queries the catalog.
// Backed by our own locally-seeded tables (see src/vehicle/seed/seed-catalog.ts), not a
// live external API -- CarAPI's 2015-2020-only free tier and NHTSA's US-market bias both
// don't fit a European collectible-car platform (see CLAUDE.md / the plan for the research).
@Injectable()
export class VehicleFactoryService {
  constructor(
    @InjectRepository(VehicleMake)
    private readonly makeRepository: Repository<VehicleMake>,
    @InjectRepository(VehicleModel)
    private readonly modelRepository: Repository<VehicleModel>,
    @InjectRepository(VehicleTrim)
    private readonly trimRepository: Repository<VehicleTrim>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  listMakes(): Promise<VehicleMake[]> {
    return this.makeRepository.find({ order: { name: 'ASC' } });
  }

  listModels(make: string): Promise<VehicleModel[]> {
    return this.modelRepository.find({
      where: { make: { name: make } },
      relations: { make: true },
      order: { name: 'ASC' },
    });
  }

  listTrims(make: string, model: string, year?: number): Promise<VehicleTrim[]> {
    return this.trimRepository.find({
      where: {
        model: { name: model, make: { name: make } },
        ...(year ? { year } : {}),
      },
      relations: { model: { make: true } },
      order: { year: 'ASC', name: 'ASC' },
    });
  }

  resolveTrim(id: number): Promise<VehicleTrim | null> {
    return this.trimRepository.findOne({
      where: { id },
      relations: { model: { make: true } },
    });
  }

  // Best-effort VIN recognition (design doc 6.2.1.1 "VIN reconnu" -- a separate scenario
  // from 6.2.1.2 "limite atteinte", which is the active-ad cap enforced in AdService, not a
  // VIN fallback). Only the WMI (first 3 chars -> manufacturer) and the model-year code are
  // actually decodable from data we have -- the rest of a VIN is manufacturer-proprietary
  // encoding we don't have access to. "Recognized" here means "we identified the make";
  // the caller still needs to pick model/trim from the catalog, same as any other listing.
  async resolveByVin(vin: string): Promise<VinLookupResult> {
    const wmi = vin.slice(0, 3).toUpperCase();
    const make = await this.makeRepository
      .createQueryBuilder('make')
      .where(':wmi = ANY(make.wmiCodes)', { wmi })
      .getOne();

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
    const make = await this.makeRepository.findOneBy({ id: input.makeId });
    if (!make) {
      throw new NotFoundException('Vehicle make not found');
    }

    const model = await this.modelRepository.findOneBy({ id: input.modelId });
    if (!model) {
      throw new NotFoundException('Vehicle model not found');
    }

    let trim: VehicleTrim | undefined;
    if (input.trimId) {
      const found = await this.trimRepository.findOneBy({ id: input.trimId });
      if (!found) {
        throw new NotFoundException('Vehicle trim not found');
      }
      trim = found;
    }

    return this.vehicleRepository.save(
      this.vehicleRepository.create({
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
      }),
    );
  }
}
