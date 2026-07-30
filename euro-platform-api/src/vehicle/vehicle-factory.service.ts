import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarApiClientService } from './car-api/car-api-client.service';
import { CarApiMake, CarApiModel, CarApiTrimDetail, CarApiTrimSummary } from './car-api/car-api.types';
import { VehicleMake } from './entities/vehicle-make.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleTrim } from './entities/vehicle-trim.entity';
import { Transmission } from './enums/transmission.enum';
import { Drivetrain } from './enums/drivetrain.enum';
import { FuelType } from './enums/fuel-type.enum';
import { BodyType } from './enums/body-type.enum';

// The design doc's Factory pattern for 6.2.1 "Creer une annonce": queries the catalog
// (CarApiClientService) and, once a specific trim is actually selected, mirrors it into
// our own tables so Vehicle can hold a real local foreign key -- CarAPI's response isn't
// something we can point a ManyToOne at.
@Injectable()
export class VehicleFactoryService {
  constructor(
    private readonly carApiClient: CarApiClientService,
    @InjectRepository(VehicleMake)
    private readonly makeRepository: Repository<VehicleMake>,
    @InjectRepository(VehicleModel)
    private readonly modelRepository: Repository<VehicleModel>,
    @InjectRepository(VehicleTrim)
    private readonly trimRepository: Repository<VehicleTrim>,
  ) {}

  listMakes(year?: number): Promise<CarApiMake[]> {
    return this.carApiClient.getMakes(year);
  }

  listModels(make: string, year?: number): Promise<CarApiModel[]> {
    return this.carApiClient.getModels(make, year);
  }

  listTrims(make: string, model: string, year?: number): Promise<CarApiTrimSummary[]> {
    return this.carApiClient.getTrims(make, model, year);
  }

  async resolveTrim(carApiTrimId: number): Promise<VehicleTrim | null> {
    const detail = await this.carApiClient.getTrimDetail(carApiTrimId);
    if (!detail) {
      return null;
    }

    const existing = await this.trimRepository.findOne({
      where: { externalId: carApiTrimId },
      relations: { model: { make: true } },
    });
    if (existing) {
      return existing;
    }

    const make = await this.findOrCreateMake(detail.make);
    const model = await this.findOrCreateModel(make, detail.model, detail);
    return this.createTrim(model, detail);
  }

  private async findOrCreateMake(name: string): Promise<VehicleMake> {
    const existing = await this.makeRepository.findOneBy({ name });
    if (existing) {
      return existing;
    }
    return this.makeRepository.save(this.makeRepository.create({ name }));
  }

  private async findOrCreateModel(
    make: VehicleMake,
    name: string,
    detail: CarApiTrimDetail,
  ): Promise<VehicleModel> {
    const existing = await this.modelRepository.findOne({
      where: { make: { id: make.id }, name },
    });
    if (existing) {
      return existing;
    }

    return this.modelRepository.save(
      this.modelRepository.create({
        make,
        name,
        bodyType: this.mapBodyType(detail.bodies?.[0]?.type),
      }),
    );
  }

  private async createTrim(model: VehicleModel, detail: CarApiTrimDetail): Promise<VehicleTrim> {
    const body = detail.bodies?.[0];
    const engine = detail.engines?.[0];

    return this.trimRepository.save(
      this.trimRepository.create({
        model,
        name: detail.trim,
        year: detail.year,
        externalId: detail.id,
        engine: engine?.engine_type,
        horsepower: engine?.horsepower_hp,
        torque: engine?.torque_ft_lbs,
        numberOfDoors: body?.doors,
        weight: body?.curb_weight,
        transmission: this.mapTransmission(detail.transmissions?.[0]?.description),
        drivetrain: this.mapDrivetrain(detail.drive_types?.[0]?.description),
        fuelType: this.mapFuelType(engine?.fuel_type),
      }),
    );
  }

  private mapBodyType(value?: string): BodyType | undefined {
    if (!value) return undefined;
    const normalized = value.toLowerCase();
    if (normalized.includes('sedan')) return BodyType.SEDAN;
    if (normalized.includes('hatchback')) return BodyType.HATCHBACK;
    if (normalized.includes('wagon')) return BodyType.WAGON;
    if (normalized.includes('coupe')) return BodyType.COUPE;
    if (normalized.includes('convertible')) return BodyType.CONVERTIBLE;
    if (normalized.includes('crossover')) return BodyType.CROSSOVER;
    if (normalized.includes('suv')) return BodyType.SUV;
    if (normalized.includes('minivan') || normalized.includes('van')) return BodyType.MINIVAN;
    if (normalized.includes('pickup') || normalized.includes('truck')) return BodyType.PICKUP;
    return undefined;
  }

  private mapTransmission(value?: string): Transmission | undefined {
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

  private mapDrivetrain(value?: string): Drivetrain | undefined {
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

  private mapFuelType(value?: string): FuelType | undefined {
    if (!value) return undefined;
    const normalized = value.toLowerCase();
    if (normalized.includes('plug')) return FuelType.PLUGIN_HYBRID;
    if (normalized.includes('hybrid')) return FuelType.HYBRID;
    if (normalized.includes('electric')) return FuelType.ELECTRIC;
    if (normalized.includes('diesel')) return FuelType.DIESEL;
    if (normalized.includes('lpg') || normalized.includes('propane')) return FuelType.LPG;
    if (normalized.includes('e85') || normalized.includes('ethanol')) return FuelType.ETHANOL;
    if (normalized.includes('gas')) return FuelType.GASOLINE;
    return undefined;
  }
}
