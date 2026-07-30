import { Controller, Get, Query } from '@nestjs/common';
import { VehicleFactoryService } from './vehicle-factory.service';

@Controller('vehicles')
export class VehicleCatalogController {
  constructor(private readonly vehicleFactory: VehicleFactoryService) {}

  @Get('makes')
  getMakes(@Query('year') year?: string) {
    return this.vehicleFactory.listMakes(year ? Number(year) : undefined);
  }

  @Get('models')
  getModels(@Query('make') make: string, @Query('year') year?: string) {
    return this.vehicleFactory.listModels(make, year ? Number(year) : undefined);
  }

  @Get('trims')
  getTrims(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('year') year?: string,
  ) {
    return this.vehicleFactory.listTrims(make, model, year ? Number(year) : undefined);
  }
}
