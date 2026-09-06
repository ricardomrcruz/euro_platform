import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { VehicleFactoryService } from './vehicle-factory.service';
import { Public } from '../auth/decorators/public.decorator';
import { FindOrCreateMakeDto } from './dto/find-or-create-make.dto';
import { FindOrCreateModelDto } from './dto/find-or-create-model.dto';
import { FindOrCreateTrimDto } from './dto/find-or-create-trim.dto';

// Browsing (GET) is public per-route below. The find-or-create (POST) routes require auth --
// unauthenticated writes to the shared catalog would let anyone pollute it.
@Controller('vehicles')
export class VehicleCatalogController {
  constructor(private readonly vehicleFactory: VehicleFactoryService) {}

  @Public()
  @Get('vin-lookup')
  lookupVin(@Query('vin') vin?: string) {
    if (!vin) {
      throw new BadRequestException('vin query param is required');
    }
    return this.vehicleFactory.resolveByVin(vin);
  }

  @Public()
  @Get('makes')
  getMakes() {
    return this.vehicleFactory.listMakes();
  }

  @Public()
  @Get('models')
  getModels(@Query('make') make: string) {
    return this.vehicleFactory.listModels(make);
  }

  @Public()
  @Get('trims')
  getTrims(@Query('make') make: string, @Query('model') model: string) {
    return this.vehicleFactory.listTrims(make, model);
  }

  // Find-or-create, resolved by the frontend at ad-submit time when a seller typed a make/
  // model/trim name that wasn't in the catalog's dropdown options.
  @Post('makes')
  createMake(@Body() dto: FindOrCreateMakeDto) {
    return this.vehicleFactory.findOrCreateMake(dto.name);
  }

  @Post('models')
  createModel(@Body() dto: FindOrCreateModelDto) {
    return this.vehicleFactory.findOrCreateModel(dto.makeId, dto.name);
  }

  @Post('trims')
  createTrim(@Body() dto: FindOrCreateTrimDto) {
    return this.vehicleFactory.findOrCreateTrim(dto.modelId, dto.name, dto.year);
  }
}
