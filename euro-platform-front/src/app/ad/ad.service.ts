import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type AdStatus = 'DRAFT' | 'REVIEW' | 'VALIDATED' | 'REJECTED';
export type VehicleCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface CreateAdPayload {
  title: string;
  description: string;
  condition: VehicleCondition;
  highlights?: string;
  knownFlaws?: string;
  modifications?: string;
  serviceHistory?: string;
  location?: string;
  makeId: number;
  modelId: number;
  trimId?: number;
  vin?: string;
  year: number;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  numberOfOwners?: number;
  plateCountry?: string;
}

export interface AdPhoto {
  id: number;
  url: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface AdVehicleSummary {
  id: number;
  vin?: string;
  year: number;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  make: { id: number; name: string };
  model: { id: number; name: string };
  trim?: { id: number; name: string };
}

export interface Ad {
  id: number;
  title: string;
  description: string;
  condition: VehicleCondition;
  status: AdStatus;
  highlights?: string;
  knownFlaws?: string;
  modifications?: string;
  serviceHistory?: string;
  location?: string;
  createdAt: string;
  rejectionMessage?: string;
  sellerId: number;
  vehicle: AdVehicleSummary;
  photos: AdPhoto[];
}

export interface AddPhotoPayload {
  url: string;
  caption?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface AdMessage {
  id: number;
  message: string;
  senderId: number;
  senderRole: 'GUEST' | 'CLIENT' | 'ADMIN';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdService {
  private readonly http = inject(HttpClient);

  create(payload: CreateAdPayload): Promise<Ad> {
    return firstValueFrom(this.http.post<Ad>('/api/ads', payload));
  }

  submit(id: number): Promise<Ad> {
    return firstValueFrom(this.http.post<Ad>(`/api/ads/${id}/submit`, {}));
  }

  addPhoto(id: number, payload: AddPhotoPayload): Promise<AdPhoto> {
    return firstValueFrom(this.http.post<AdPhoto>(`/api/ads/${id}/photos`, payload));
  }

  // GET /me/ads -- every status, seller's own ads only.
  getMine(): Promise<Ad[]> {
    return firstValueFrom(this.http.get<Ad[]>('/api/me/ads'));
  }

  // GET /ads/pending -- ADMIN only, REVIEW-status ads.
  getPending(): Promise<Ad[]> {
    return firstValueFrom(this.http.get<Ad[]>('/api/ads/pending'));
  }

  validate(id: number): Promise<Ad> {
    return firstValueFrom(this.http.post<Ad>(`/api/ads/${id}/validate`, {}));
  }

  reject(id: number, message: string): Promise<Ad> {
    return firstValueFrom(this.http.post<Ad>(`/api/ads/${id}/reject`, { message }));
  }

  listMessages(id: number): Promise<AdMessage[]> {
    return firstValueFrom(this.http.get<AdMessage[]>(`/api/ads/${id}/messages`));
  }

  addMessage(id: number, message: string): Promise<AdMessage> {
    return firstValueFrom(this.http.post<AdMessage>(`/api/ads/${id}/messages`, { message }));
  }
}
