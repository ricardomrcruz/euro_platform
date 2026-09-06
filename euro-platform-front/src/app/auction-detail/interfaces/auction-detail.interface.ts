import type { AuctionState, Bid } from '../../auction/interfaces/auction.interface';

export interface DetailSection {
  headingKey: string;
  paragraphs?: string[];
  items?: string[];
}

export interface VideoItem {
  thumbnailUrl: string;
  caption: string;
}

export interface CommentItem {
  id: number;
  author: string;
  isSeller?: boolean;
  upvotes: number;
  timeAgo: string;
  replyToAuthor?: string;
  kind: 'comment' | 'bid';
  body?: string;
  bidAmount?: number;
}

export interface AuctionSpecs {
  make: string;
  model: string;
  engine: string;
  drivetrain: string;
  mileage: number;
  transmission: string;
  vin: string;
  bodyStyle: string;
  titleStatus: string;
  exteriorColor: string;
  interiorColor: string;
  location: string;
}

export interface AuctionDetailData {
  id: number;
  title: string;
  subtitle: string;
  reserveStatus: 'reserve' | 'no-reserve';
  mainPhotoUrl: string;
  // Exactly 7 real thumbnails are shown plainly (2-col x 4-row grid); the gallery adds an
  // 8th "see all" tile on top of a blurred photo, driven by totalPhotoCount.
  thumbnailUrls: string[];
  totalPhotoCount: number;
  currentBid: number;
  buyNowPrice?: number;
  sellerId: number;
  state: AuctionState;
  bidderName: string;
  sellerName: string;
  sellerType: 'dealer' | 'private';
  endDate: Date;
  bidsCount: number;
  viewsCount: number;
  watchingCount: number;
  specs: AuctionSpecs;
  detailSections: DetailSection[];
  videos: VideoItem[];
  comments: CommentItem[];
  bids: Bid[];
}

// Sub-component-local view types -- grouped here too rather than scattered across
// auction-specs.component.ts/auction-comments.component.ts, since this page already has
// several related interfaces worth keeping in one place.
export interface SpecRow {
  labelKey: string;
  value?: string;
  valueKey?: string;
}
