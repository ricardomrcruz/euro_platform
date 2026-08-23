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
  ad: { id: number; title: string };
}

@Injectable({ providedIn: 'root' })
export class AuctionService {
  private readonly http = inject(HttpClient);

  launch(adId: number, payload: LaunchAuctionPayload): Promise<Auction> {
    return firstValueFrom(this.http.post<Auction>(`/api/ads/${adId}/auction`, payload));
  }

  // GET /auctions -- @Public(), LIVE-state auctions only. Ad has no relation back to Auction
  // on the backend, so this is how the profile page tells an already-launched VALIDATED ad
  // apart from one that isn't -- doesn't catch a SOLD/EXPIRED/CANCELLED auction for the same
  // ad, a real edge case, but launch() itself still blocks re-launching with a 409 either way.
  listLive(): Promise<Auction[]> {
    return firstValueFrom(this.http.get<Auction[]>('/api/auctions'));
  }
}
