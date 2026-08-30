import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  listTrimsByMakeModelYear(make: string, model: string, year?: number): Promise<VehicleTrim[]> {
    return this.trimRepository.find({
      where: {
        model: { name: model, make: { name: make } },
        ...(year ? { year } : {}),
      },
      relations: { model: { make: true } },
      order: { year: 'ASC', name: 'ASC' },
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
}
