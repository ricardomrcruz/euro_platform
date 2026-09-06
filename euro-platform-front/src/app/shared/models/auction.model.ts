import type { AuctionState } from '../../auction/interfaces/auction.interface';

export interface AuctionCardData {
  id: number;
  photoUrl: string;
  title: string;
  highlights: string;
  location: string;
  currentBid: number;
  endDate: Date;
  listedAt: Date;
  mileage: number;
  badge?: 'NO RESERVE';
  state: AuctionState;
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
