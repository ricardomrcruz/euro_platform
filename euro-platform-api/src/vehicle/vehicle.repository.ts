import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { VehicleMake } from './entities/vehicle-make.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleTrim } from './entities/vehicle-trim.entity';
import { VehicleTrimPowertrain } from './entities/vehicle-trim-powertrain.entity';
import { Vehicle } from './entities/vehicle.entity';
import { FuelType } from './enums/fuel-type.enum';

// Make/model/trim/vehicle are one catalog hierarchy always queried together -- kept as a
// single repository rather than one class per entity.
@Injectable()
export class VehicleRepository {
  constructor(
    @InjectRepository(VehicleMake)
    private readonly makeRepository: Repository<VehicleMake>,
    @InjectRepository(VehicleModel)
    private readonly modelRepository: Repository<VehicleModel>,
    @InjectRepository(VehicleTrim)
    private readonly trimRepository: Repository<VehicleTrim>,
    @InjectRepository(VehicleTrimPowertrain)
    private readonly trimPowertrainRepository: Repository<VehicleTrimPowertrain>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  listMakes(): Promise<VehicleMake[]> {
    return this.makeRepository.find({ order: { name: 'ASC' } });
  }

  findMakeById(id: number): Promise<VehicleMake | null> {
    return this.makeRepository.findOneBy({ id });
  }

  findMakeByWmi(wmi: string): Promise<VehicleMake | null> {
    return this.makeRepository
      .createQueryBuilder('make')
      .where(':wmi = ANY(make.wmiCodes)', { wmi })
      .getOne();
  }

  listModelsByMakeName(make: string): Promise<VehicleModel[]> {
    return this.modelRepository.find({
      where: { make: { name: make } },
      relations: { make: true },
      order: { name: 'ASC' },
    });
  }

  findModelById(id: number): Promise<VehicleModel | null> {
    return this.modelRepository.findOneBy({ id });
  }

  listTrimsByMakeModel(make: string, model: string): Promise<VehicleTrim[]> {
    return this.trimRepository.find({
      where: { model: { name: model, make: { name: make } } },
      relations: { model: { make: true }, powertrains: true },
      order: { name: 'ASC' },
    });
  }

  findTrimByIdWithMakeModel(id: number): Promise<VehicleTrim | null> {
    return this.trimRepository.findOne({
      where: { id },
      relations: { model: { make: true }, powertrains: true },
    });
  }

  findTrimById(id: number): Promise<VehicleTrim | null> {
    return this.trimRepository.findOneBy({ id });
  }

  createVehicle(data: Partial<Vehicle>): Vehicle {
    return this.vehicleRepository.create(data);
  }

  saveVehicle(vehicle: Vehicle): Promise<Vehicle> {
    return this.vehicleRepository.save(vehicle);
  }

  // Find-or-create, mirroring seed-catalog.ts's own pattern -- lets a seller submit a car
  // whose make/model/trim isn't in the (patchily-seeded) catalog yet, instead of being stuck.
  async findOrCreateMakeByName(name: string): Promise<VehicleMake> {
    const trimmed = name.trim();
    const existing = await this.makeRepository.findOne({ where: { name: ILike(trimmed) } });
    if (existing) return existing;
    return this.makeRepository.save(this.makeRepository.create({ name: trimmed }));
  }

  async findOrCreateModelByName(makeId: number, name: string): Promise<VehicleModel> {
    const trimmed = name.trim();
    const existing = await this.modelRepository.findOne({
      where: { name: ILike(trimmed), make: { id: makeId } },
    });
    if (existing) return existing;

    const make = await this.findMakeById(makeId);
    if (!make) {
      throw new NotFoundException('Vehicle make not found');
    }
    return this.modelRepository.save(this.modelRepository.create({ name: trimmed, make }));
  }

  // A finition typed by a seller isn't necessarily new -- it may already exist under a
  // different fuel type. Also find-or-creates the specific fuel-type powertrain row so the
  // trim always has one for whichever fuel type the seller is actually building the ad with.
  async findOrCreateTrimByName(
    modelId: number,
    name: string,
    fuelType?: FuelType,
  ): Promise<VehicleTrim> {
    const trimmed = name.trim();
    let trim = await this.trimRepository.findOne({
      where: { name: ILike(trimmed), model: { id: modelId } },
    });

    if (!trim) {
      const model = await this.findModelById(modelId);
      if (!model) {
        throw new NotFoundException('Vehicle model not found');
      }
      trim = await this.trimRepository.save(this.trimRepository.create({ name: trimmed, model }));
    }

    if (fuelType) {
      const existingPowertrain = await this.trimPowertrainRepository.findOne({
        where: { trim: { id: trim.id }, fuelType },
      });
      if (!existingPowertrain) {
        await this.trimPowertrainRepository.save(
          this.trimPowertrainRepository.create({ trim, fuelType }),
        );
      }
    }

    return trim;
  }
}
