import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { VehicleFactoryService } from './vehicle-factory.service';

@Controller('vehicles')
export class VehicleCatalogController {
  constructor(private readonly vehicleFactory: VehicleFactoryService) {}

  @Get('vin-lookup')
  lookupVin(@Query('vin') vin?: string) {
    if (!vin) {
      throw new BadRequestException('vin query param is required');
    }
    return this.vehicleFactory.resolveByVin(vin);
  }

  @Get('makes')
  getMakes() {
    return this.vehicleFactory.listMakes();
  }

  @Get('models')
  getModels(@Query('make') make: string) {
    return this.vehicleFactory.listModels(make);
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
