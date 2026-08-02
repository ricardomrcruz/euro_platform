import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleMake } from './entities/vehicle-make.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleTrim } from './entities/vehicle-trim.entity';
import { decodeModelYear } from './vin-year.util';

export interface VinLookupResult {
  recognized: boolean;
  wmi: string;
  make: VehicleMake | null;
  modelYear?: number;
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

  // Best-effort VIN recognition (design doc 6.2.1: "VIN reconnu" / "VIN non reconnu, limite
  // atteinte"). Only the WMI (first 3 chars -> manufacturer) and the model-year code are
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
}
