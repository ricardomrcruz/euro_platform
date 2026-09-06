import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auction, Bid, LaunchAuctionPayload } from './interfaces/auction.interface';

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

  // Live auctions plus anything finished within the last two weeks, live ones first.
  listFeed(): Promise<Auction[]> {
    return firstValueFrom(this.http.get<Auction[]>('/api/auctions/feed'));
  }

  // Every auction ever, live ones first, then every finished one (most recent first).
  listHistory(): Promise<Auction[]> {
    return firstValueFrom(this.http.get<Auction[]>('/api/auctions/history'));
  }

  getOne(id: number): Promise<Auction> {
    return firstValueFrom(this.http.get<Auction>(`/api/auctions/${id}`));
  }

  placeBid(auctionId: number, amount: number): Promise<Bid> {
    return firstValueFrom(this.http.post<Bid>(`/api/auctions/${auctionId}/bids`, { amount }));
  }

  buyNow(auctionId: number): Promise<Bid> {
    return firstValueFrom(this.http.post<Bid>(`/api/auctions/${auctionId}/buy-now`, {}));
  }

  // Newest first -- also doubles as the real bid count (bids().length) since bidsCount was
  // previously always hardcoded to 0.
  listBids(auctionId: number): Promise<Bid[]> {
    return firstValueFrom(this.http.get<Bid[]>(`/api/auctions/${auctionId}/bids`));
  }
}
