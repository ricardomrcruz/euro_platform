import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { VehicleMake } from './entities/vehicle-make.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleTrim } from './entities/vehicle-trim.entity';
import { Vehicle } from './entities/vehicle.entity';

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
      relations: { model: { make: true } },
      order: { name: 'ASC' },
    });
  }

  findTrimByIdWithMakeModel(id: number): Promise<VehicleTrim | null> {
    return this.trimRepository.findOne({ where: { id }, relations: { model: { make: true } } });
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

  async findOrCreateTrimByName(modelId: number, name: string, year?: number): Promise<VehicleTrim> {
    const trimmed = name.trim();
    const existing = await this.trimRepository.findOne({
      where: { name: ILike(trimmed), model: { id: modelId } },
    });
    if (existing) return existing;

    const model = await this.findModelById(modelId);
    if (!model) {
      throw new NotFoundException('Vehicle model not found');
    }
    return this.trimRepository.save(this.trimRepository.create({ name: trimmed, year, model }));
  }
}
