// Shared shapes for the homepage/auction-detail views, plus a placeholder-image helper used
// as a fallback when a real ad has no photos yet. Real data comes from AuctionService
// (see toAuctionCardData/toFeaturedCar/toAuctionDetailData in ../auction/auction.service.ts) --
// no mock listings are seeded from this file anymore.
import type { AuctionState } from '../auction/interfaces/auction.interface';

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

export function placeholder(label: string, bg = 'CBD5E1', fg = '1E293B', size = '800x600'): string {
  return `https://placehold.co/${size}/${bg}/${fg}?text=${encodeURIComponent(label)}`;
}
