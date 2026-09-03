import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  VehicleMake,
  VehicleModel,
  VehicleTrim,
  VinLookupResult,
} from './interfaces/vehicle-catalog.interface';

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

  // Find-or-create -- used when a seller types a make/model/trim name that isn't in the
  // catalog's dropdown options, resolved once at ad-submit time (not on every keystroke).
  findOrCreateMake(name: string): Promise<VehicleMake> {
    return firstValueFrom(this.http.post<VehicleMake>('/api/vehicles/makes', { name }));
  }

  findOrCreateModel(makeId: number, name: string): Promise<VehicleModel> {
    return firstValueFrom(
      this.http.post<VehicleModel>('/api/vehicles/models', { makeId, name }),
    );
  }

  findOrCreateTrim(modelId: number, name: string, year: number): Promise<VehicleTrim> {
    return firstValueFrom(
      this.http.post<VehicleTrim>('/api/vehicles/trims', { modelId, name, year }),
    );
  }
}
