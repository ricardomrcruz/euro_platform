import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Ad,
  AdMessage,
  AdPhoto,
  AddPhotoPayload,
  CreateAdPayload,
  RequestUploadUrlPayload,
  SignedUpload,
} from './interfaces/ad.interface';

@Injectable({ providedIn: 'root' })
export class AdService {
  private readonly http = inject(HttpClient);

  create(payload: CreateAdPayload): Promise<Ad> {
    return firstValueFrom(this.http.post<Ad>('/api/ads', payload));
  }

  // Only valid while ad.canEdit() on the backend (DRAFT or REJECTED) -- 403s otherwise.
  update(id: number, payload: CreateAdPayload): Promise<Ad> {
    return firstValueFrom(this.http.patch<Ad>(`/api/ads/${id}`, payload));
  }

  getOne(id: number): Promise<Ad> {
    return firstValueFrom(this.http.get<Ad>(`/api/ads/${id}`));
  }

  submit(id: number): Promise<Ad> {
    return firstValueFrom(this.http.post<Ad>(`/api/ads/${id}/submit`, {}));
  }

  addPhoto(id: number, payload: AddPhotoPayload): Promise<AdPhoto> {
    return firstValueFrom(this.http.post<AdPhoto>(`/api/ads/${id}/photos`, payload));
  }

  requestUploadUrl(id: number, payload: RequestUploadUrlPayload): Promise<SignedUpload> {
    return firstValueFrom(
      this.http.post<SignedUpload>(`/api/ads/${id}/photos/upload-url`, payload),
    );
  }

  // uploadUrl is an absolute https://storage.googleapis.com/... URL -- auth.interceptor.ts's
  // "/api/ only" guard already skips attaching our JWT to it, so no interceptor change needed.
  async uploadFileToSignedUrl(uploadUrl: string, file: File): Promise<void> {
    await firstValueFrom(
      this.http.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        responseType: 'text',
      }),
    );
  }

  // GET /account/ads -- every status, seller's own ads only.
  getMine(): Promise<Ad[]> {
    return firstValueFrom(this.http.get<Ad[]>('/api/account/ads'));
  }

  // GET /ads -- public, VALIDATED ads across every seller.
  list(): Promise<Ad[]> {
    return firstValueFrom(this.http.get<Ad[]>('/api/ads'));
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
