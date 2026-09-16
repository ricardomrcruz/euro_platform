export type AuctionState = 'LIVE' | 'SOLD' | 'EXPIRED' | 'CANCELLED';

export interface LaunchAuctionPayload {
  endDate: string;
  reservePrice: number;
  buyNowPrice?: number;
}

export interface AuctionPhoto {
  id: number;
  url: string;
  category: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface AuctionVehicleSummary {
  id: number;
  vin?: string;
  year: number;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  make: { id: number; name: string };
  model: { id: number; name: string; bodyType?: string };
  trim?: { id: number; name: string };
}

// sellerName is "First L." style, resolved server-side via a batched euro-auth lookup --
// undefined only if that lookup somehow returned nothing for this seller (shouldn't happen
// in practice, the backend always falls back to "User #<id>").
export interface AuctionAdSummary {
  id: number;
  title: string;
  description: string;
  highlights?: string;
  knownFlaws?: string;
  modifications?: string;
  serviceHistory?: string;
  location?: string;
  sellerId: number;
  sellerName?: string;
  vehicle: AuctionVehicleSummary;
  photos: AuctionPhoto[];
}

export interface Auction {
  id: number;
  startDate: string;
  endDate: string;
  reservePrice: number;
  buyNowPrice?: number;
  currentHighestBid?: number;
  state: AuctionState;
  ad: AuctionAdSummary;
}

export interface Bid {
  id: number;
  amount: number;
  commission: number;
  timestamp: string;
  bidderId: number;
  bidderName?: string;
}

export interface BidPlacedEvent {
  auctionId: number;
  amount: number;
  bidderName: string;
  timestamp: string;
  currentHighestBid: number;
  bidsCount: number;
}

export interface AuctionClosedEvent {
  auctionId: number;
  state: AuctionState;
}
