import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { VehicleFactoryService } from './vehicle-factory.service';
import { Public } from '../auth/decorators/public.decorator';

// Every endpoint here is public browsing -- applied at class level since nothing in this
// controller should ever require auth. Without this, the new global AuthGuard would start
// blocking catalog browsing, which used to be unauthenticated by default (no guard existed).
@Public()
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
