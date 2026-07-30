import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarApiClientService } from './car-api/car-api-client.service';
import { VehicleCatalogController } from './vehicle-catalog.controller';
import { VehicleFactoryService } from './vehicle-factory.service';
import { VehicleMake } from './entities/vehicle-make.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleTrim } from './entities/vehicle-trim.entity';
import { Vehicle } from './entities/vehicle.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([VehicleMake, VehicleModel, VehicleTrim, Vehicle]),
  ],
  controllers: [VehicleCatalogController],
  providers: [CarApiClientService, VehicleFactoryService],
})
export class VehicleModule {}
