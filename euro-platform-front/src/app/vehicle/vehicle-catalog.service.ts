import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface VehicleMake {
  id: number;
  name: string;
  country?: string;
  logoUrl?: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  bodyType?: string;
  yearStart?: number;
  yearEnd?: number;
}

export interface VehicleTrim {
  id: number;
  name: string;
  engine?: string;
  horsepower?: number;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  year?: number;
}

export interface VinLookupResult {
  recognized: boolean;
  wmi: string;
  make: VehicleMake | null;
  modelYear?: number;
}

// The catalog browsing endpoints filter by make/model NAME (not id) -- confirmed from
// VehicleFactoryService.listModels/listTrims. Callers must keep both the id (for
// CreateAdDto) and the name (to feed the next cascade level) as the user picks each level.
@Injectable({ providedIn: 'root' })
export class VehicleCatalogService {
  private readonly http = inject(HttpClient);

  lookupVin(vin: string): Promise<VinLookupResult> {
    return firstValueFrom(
      this.http.get<VinLookupResult>('/api/vehicles/vin-lookup', { params: { vin } }),
    );
  }

  listMakes(): Promise<VehicleMake[]> {
    return firstValueFrom(this.http.get<VehicleMake[]>('/api/vehicles/makes'));
  }

  listModels(makeName: string): Promise<VehicleModel[]> {
    return firstValueFrom(
      this.http.get<VehicleModel[]>('/api/vehicles/models', { params: { make: makeName } }),
    );
  }

  listTrims(makeName: string, modelName: string): Promise<VehicleTrim[]> {
    return firstValueFrom(
      this.http.get<VehicleTrim[]>('/api/vehicles/trims', {
        params: { make: makeName, model: modelName },
      }),
    );
  }
}
