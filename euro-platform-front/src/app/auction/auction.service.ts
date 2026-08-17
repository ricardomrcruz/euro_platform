import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type AuctionState = 'LIVE' | 'SOLD' | 'EXPIRED' | 'CANCELLED';

export interface LaunchAuctionPayload {
  endDate: string;
  reservePrice: number;
  buyNowPrice?: number;
}

export interface Auction {
  id: number;
  startDate: string;
  endDate: string;
  reservePrice: number;
  buyNowPrice?: number;
  currentHighestBid?: number;
  state: AuctionState;
}

@Injectable({ providedIn: 'root' })
export class AuctionService {
  private readonly http = inject(HttpClient);

  launch(adId: number, payload: LaunchAuctionPayload): Promise<Auction> {
    return firstValueFrom(this.http.post<Auction>(`/api/ads/${adId}/auction`, payload));
  }
}
