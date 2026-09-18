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

// thumbnailUrls is padded/cycled to exactly 7 entries for the 2-col x 4-row grid (the 8th
// tile is the "see all" overlay, driven by totalPhotoCount); photoUrls is the real,
// deduplicated set (cover photo first) that the fullscreen slideshow browses instead.
// closedAt is only set for a buy-now close -- endDate stays accurate otherwise.
export interface AuctionDetailData {
  id: number;
  title: string;
  subtitle: string;
  reserveStatus: 'reserve' | 'no-reserve';
  mainPhotoUrl: string;
  thumbnailUrls: string[];
  totalPhotoCount: number;
  photoUrls: string[];
  currentBid: number;
  buyNowPrice?: number;
  sellerId: number;
  state: AuctionState;
  bidderName: string;
  sellerName: string;
  sellerType: 'dealer' | 'private';
  endDate: Date;
  closedAt?: Date;
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
