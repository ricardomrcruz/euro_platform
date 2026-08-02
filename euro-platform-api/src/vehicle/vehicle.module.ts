import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleCatalogController } from './vehicle-catalog.controller';
import { VehicleFactoryService } from './vehicle-factory.service';
import { VehicleMake } from './entities/vehicle-make.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleTrim } from './entities/vehicle-trim.entity';
import { Vehicle } from './entities/vehicle.entity';

// CarAPI's HttpModule/CarApiClientService are deliberately not wired in here -- dormant,
// not deleted (see car-api/). The catalog is backed by locally-seeded data instead
// (see src/vehicle/seed/seed-catalog.ts).
@Module({
  imports: [TypeOrmModule.forFeature([VehicleMake, VehicleModel, VehicleTrim, Vehicle])],
  controllers: [VehicleCatalogController],
  providers: [VehicleFactoryService],
  exports: [VehicleFactoryService],
})
export class VehicleModule {}
