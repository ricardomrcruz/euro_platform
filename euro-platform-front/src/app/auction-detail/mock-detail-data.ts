// UI-mock data only -- no backend wiring yet. Real data will come from GET /ads/:id and its
// auction/bid records once the frontend's data needs are settled and the DTOs get built
// around them. Only the seeded auction below (id 10) has a fully fleshed-out detail record;
// every other homepage listing falls back to a lightweight generated detail so every card
// stays clickable without writing 10x the mock content.

import { MOCK_AUCTIONS, AuctionCardData, FEATURED_CARS, FeaturedCar, placeholder } from '../home/mock-data';

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
}

const skylineCard = MOCK_AUCTIONS.find((a) => a.id === 10)!;

const SEEDED_DETAILS: Record<number, AuctionDetailData> = {
  10: {
    id: 10,
    title: skylineCard.title,
    subtitle: skylineCard.highlights,
    reserveStatus: 'reserve',
    mainPhotoUrl: placeholder(skylineCard.title, 'CBD5E1', '0F172A', '1200x800'),
    thumbnailUrls: [
      placeholder('Front 3/4', '94A3B8', '0F172A'),
      placeholder('Side Profile', 'CBD5E1', '0F172A'),
      placeholder('Rear 3/4', '94A3B8', '0F172A'),
      placeholder('Rear', 'CBD5E1', '0F172A'),
      placeholder('Interior', '94A3B8', '0F172A'),
      placeholder('Dashboard', 'CBD5E1', '0F172A'),
      placeholder('Engine Bay', '94A3B8', '0F172A'),
    ],
    totalPhotoCount: 24,
    currentBid: skylineCard.currentBid,
    bidderName: 'trackdaytom',
    sellerName: 'importgarage',
    sellerType: 'dealer',
    endDate: skylineCard.endDate,
    bidsCount: 9,
    viewsCount: 4210,
    watchingCount: 312,
    specs: {
      make: 'Nissan',
      model: 'R32 Skyline GT-R',
      engine: '2.6L Twin-Turbo Inline-6 (RB26DETT)',
      drivetrain: 'AWD (ATTESA E-TS)',
      mileage: skylineCard.mileage,
      transmission: '5-Speed Manual',
      vin: 'JN1BNAR32U0123456',
      bodyStyle: 'Coupe',
      titleStatus: 'Clean (Import)',
      exteriorColor: 'Gunmetal Gray',
      interiorColor: 'Black',
      location: skylineCard.location,
    },
    detailSections: [
      {
        headingKey: 'auctionDetail.sections.description',
        paragraphs: [
          "Nissan's R32-generation Skyline GT-R, known to fans as \"Godzilla,\" redefined what a Japanese performance car could be when it launched in 1989. This example pairs the iconic twin-turbocharged RB26DETT inline-six with Nissan's ATTESA E-TS all-wheel-drive system, delivering the all-weather, all-conditions performance the R32 became legendary for.",
          'This particular car was imported under the 25-year rule and retains its original right-hand-drive JDM configuration throughout.',
        ],
      },
      {
        headingKey: 'auctionDetail.sections.highlights',
        items: [
          'Finished in Gunmetal Gray over a black interior.',
          "This Skyline's odometer shows approximately 47,000 kilometers.",
          'Imported through the 25-year rule, this GT-R retains its right-hand-drive JDM configuration.',
          'The RB26DETT twin-turbo inline-six is reported largely unmodified by the selling dealer.',
          "Power is sent to all four wheels via Nissan's ATTESA E-TS all-wheel-drive system and a 5-speed manual gearbox.",
        ],
      },
      {
        headingKey: 'auctionDetail.sections.equipment',
        items: [
          'Factory BBS wheels',
          'Nismo suspension upgrade',
          'Recaro front seats',
          'Boost gauge cluster',
          'HICAS four-wheel steering',
        ],
      },
      {
        headingKey: 'auctionDetail.sections.modifications',
        items: [
          'Aftermarket exhaust system',
          'Upgraded front-mount intercooler',
          'Short-shifter kit',
        ],
      },
      {
        headingKey: 'auctionDetail.sections.knownFlaws',
        items: [
          'Minor clear-coat peel on the rear hatch',
          'Small stone chip on the front bumper',
        ],
      },
      {
        headingKey: 'auctionDetail.sections.recentServiceHistory',
        paragraphs: ['Reported by the selling dealer:'],
        items: [
          '2025 (46,200 km): Timing belt and water pump replaced',
          '2024 (44,800 km): Twin-turbo system inspected, boost lines replaced',
        ],
      },
      {
        headingKey: 'auctionDetail.sections.otherItemsIncluded',
        items: ['1 key', 'Import documentation'],
      },
      {
        headingKey: 'auctionDetail.sections.ownershipHistory',
        paragraphs: [
          'The selling dealer imported this GT-R in 2025 and has completed minor service since acquiring it.',
        ],
      },
      {
        headingKey: 'auctionDetail.sections.sellerNotes',
        paragraphs: [
          'The selling dealer notes the car is unmodified from factory turbo specification and has never been tracked.',
        ],
      },
    ],
    videos: [
      { thumbnailUrl: placeholder('Walkaround', '94A3B8', '0F172A', '640x360'), caption: 'Walkaround Video' },
      { thumbnailUrl: placeholder('Driving', 'CBD5E1', '0F172A', '640x360'), caption: 'Driving Video' },
    ],
    comments: [
      { id: 1, author: 'jdmnut', upvotes: 14, timeAgo: '3h', kind: 'comment', body: 'Love these R32s in Gunmetal, such a clean color combo.' },
      { id: 2, author: 'importgarage', isSeller: true, upvotes: 6, timeAgo: '10h', kind: 'comment', body: 'Thanks everyone for the interest! Happy to answer any questions on service history or the import paperwork.' },
      { id: 3, author: 'boosted_bri', upvotes: 2, timeAgo: '12h', kind: 'comment', replyToAuthor: 'jdmnut', body: 'Agreed, way better than the usual white or black ones you see.' },
      { id: 4, author: 'trackdaytom', upvotes: 0, timeAgo: '16h', kind: 'bid', bidAmount: 65000 },
      { id: 5, author: 'r32collector', upvotes: 9, timeAgo: '19h', kind: 'comment', body: 'Any recent compression numbers on the RB26? Would love to see a leak-down test before bidding further.' },
      { id: 6, author: 'importgarage', isSeller: true, upvotes: 11, timeAgo: '1d', kind: 'comment', replyToAuthor: 'r32collector', body: "We don't have a fresh compression test on hand, but happy to arrange one with a shop of the buyer's choice before the auction ends." },
      { id: 7, author: 'gunmetalgtr', upvotes: 0, timeAgo: '2d', kind: 'bid', bidAmount: 58500 },
      { id: 8, author: 'skylinesteve', upvotes: 5, timeAgo: '2d', kind: 'comment', body: 'Had one of these years ago, that RB26 sound is unmatched. GLWS!' },
      { id: 9, author: 'importgarage', isSeller: true, upvotes: 18, timeAgo: '3d', kind: 'comment', body: "Hi all, thanks for checking out our GT-R. It's a well-kept RHD import with clean service records. Fire away with any questions!" },
    ],
  },
};

function buildFallbackDetail(card: AuctionCardData): AuctionDetailData {
  return {
    id: card.id,
    title: card.title,
    subtitle: card.highlights,
    reserveStatus: card.badge === 'NO RESERVE' ? 'no-reserve' : 'reserve',
    mainPhotoUrl: card.photoUrl,
    thumbnailUrls: [
      placeholder('Front 3/4', '94A3B8', '0F172A'),
      placeholder('Side Profile', 'CBD5E1', '0F172A'),
      placeholder('Rear 3/4', '94A3B8', '0F172A'),
      placeholder('Rear', 'CBD5E1', '0F172A'),
      placeholder('Interior', '94A3B8', '0F172A'),
      placeholder('Dashboard', 'CBD5E1', '0F172A'),
      placeholder('Engine Bay', '94A3B8', '0F172A'),
    ],
    totalPhotoCount: 8,
    currentBid: card.currentBid,
    bidderName: 'HighBidder',
    sellerName: 'euroCarsSeller',
    sellerType: 'dealer',
    endDate: card.endDate,
    bidsCount: 3,
    viewsCount: 850,
    watchingCount: 40,
    specs: {
      make: '—',
      model: '—',
      engine: '—',
      drivetrain: '—',
      mileage: card.mileage,
      transmission: '—',
      vin: '—',
      bodyStyle: '—',
      titleStatus: '—',
      exteriorColor: '—',
      interiorColor: '—',
      location: card.location,
    },
    detailSections: [
      { headingKey: 'auctionDetail.sections.description', paragraphs: [card.highlights] },
    ],
    videos: [],
    comments: [],
  };
}

// The hero carousel's "featured" dataset has a different shape (no location/mileage/
// highlights) and its own id range, so it gets its own minimal fallback builder. Its own
// detailPhotoUrls stays a 4-tuple for the homepage hero's unrelated 2x2 layout -- padded
// with generic placeholders here since this gallery needs 7.
function buildFallbackDetailFromFeatured(car: FeaturedCar): AuctionDetailData {
  return {
    id: car.id,
    title: car.title,
    subtitle: car.subtitle,
    reserveStatus: 'reserve',
    mainPhotoUrl: car.mainPhotoUrl,
    thumbnailUrls: [
      ...car.detailPhotoUrls,
      placeholder('Dashboard', '94A3B8', '0F172A'),
      placeholder('Side Profile', 'CBD5E1', '0F172A'),
      placeholder('Rear', '94A3B8', '0F172A'),
    ],
    totalPhotoCount: 8,
    currentBid: car.currentBid,
    bidderName: 'HighBidder',
    sellerName: 'euroCarsSeller',
    sellerType: 'dealer',
    endDate: car.endDate,
    bidsCount: 3,
    viewsCount: 850,
    watchingCount: 40,
    specs: {
      make: '—',
      model: '—',
      engine: '—',
      drivetrain: '—',
      mileage: 0,
      transmission: '—',
      vin: '—',
      bodyStyle: '—',
      titleStatus: '—',
      exteriorColor: '—',
      interiorColor: '—',
      location: '—',
    },
    detailSections: [
      { headingKey: 'auctionDetail.sections.description', paragraphs: [car.subtitle] },
    ],
    videos: [],
    comments: [],
  };
}

export function getAuctionDetail(id: number): AuctionDetailData | undefined {
  if (SEEDED_DETAILS[id]) return SEEDED_DETAILS[id];
  const card = MOCK_AUCTIONS.find((a) => a.id === id);
  if (card) return buildFallbackDetail(card);
  const featured = FEATURED_CARS.find((f) => f.id === id);
  return featured ? buildFallbackDetailFromFeatured(featured) : undefined;
}
