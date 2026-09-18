import type { AuctionState } from '../../auction/interfaces/auction.interface';

// closedAt is only set for a buy-now close -- endDate stays accurate otherwise.
export interface AuctionCardData {
  id: number;
  photoUrl: string;
  title: string;
  highlights: string;
  location: string;
  currentBid: number;
  endDate: Date;
  closedAt?: Date;
  listedAt: Date;
  mileage: number;
  badge?: 'NO RESERVE';
  state: AuctionState;
  year: number;
  transmission?: string;
  bodyType?: string;
}

export interface FeaturedCar {
  id: number;
  title: string;
  subtitle: string;
  mainPhotoUrl: string;
  detailPhotoUrls: [string, string, string, string];
  currentBid: number;
  endDate: Date;
}
