import { AuctionCardData, FeaturedCar } from '../shared/models/auction.model';
import { placeholder } from '../shared/utils/photo-placeholder.util';
import { primaryPhotoUrl } from '../shared/utils/photo.util';
import { AuctionDetailData, DetailSection } from '../auction-detail/interfaces/auction-detail.interface';
import { Auction, Bid } from './interfaces/auction.interface';

// Matches AuctionGalleryComponent's fixed 2-col x 4-row thumbnail grid (7 photo cells + 1
// "see all" cell).
const GALLERY_THUMBNAIL_COUNT = 7;

// Real Auction -> the homepage grid's card shape. Several mock-only fields have no backend
// equivalent and are dropped rather than faked: `badge` (no "no reserve" flag on Auction).
export function toAuctionCardData(auction: Auction): AuctionCardData {
  const { ad } = auction;
  return {
    id: auction.id,
    photoUrl: primaryPhotoUrl(ad.photos, ad.title),
    title: ad.title,
    highlights: ad.highlights ?? '',
    location: ad.location ?? '',
    currentBid: auction.currentHighestBid ?? auction.reservePrice,
    endDate: new Date(auction.endDate),
    // No "ad first listed" timestamp exists on Auction -- startDate is the closest proxy.
    listedAt: new Date(auction.startDate),
    mileage: ad.vehicle.mileage ?? 0,
    state: auction.state,
  };
}

// Real Auction -> the hero carousel's featured-car shape.
export function toFeaturedCar(auction: Auction): FeaturedCar {
  const { ad } = auction;
  const nonPrimary = ad.photos.filter((p) => !p.isPrimary);
  const detailPhotoUrls = [0, 1, 2, 3].map(
    (i) => nonPrimary[i]?.url ?? placeholder(`${ad.title} ${i + 1}`),
  ) as [string, string, string, string];

  return {
    id: auction.id,
    title: ad.title,
    subtitle: ad.highlights ?? '',
    mainPhotoUrl: primaryPhotoUrl(ad.photos, ad.title),
    detailPhotoUrls,
    currentBid: auction.currentHighestBid ?? auction.reservePrice,
    endDate: new Date(auction.endDate),
  };
}

// Real Auction -> the detail page's shape. Several mock-only fields have no backend
// equivalent at all (videos, comments, view/watch counts, bidder/seller display name,
// engine/drivetrain/transmission/bodyStyle/titleStatus) -- these are emptied/placeholdered
// here rather than invented, matching mock-detail-data.ts's own '—' fallback convention.
export function toAuctionDetailData(auction: Auction, bids: Bid[] = []): AuctionDetailData {
  const { ad } = auction;
  const mainUrl = primaryPhotoUrl(ad.photos, ad.title);
  const photos = [...ad.photos].sort((a, b) => a.sortOrder - b.sortOrder);
  // Exclude whatever's shown as the large hero photo so it isn't repeated in the thumbnail
  // strip -- falls back to repeating it only when there are no other photos at all.
  const otherPhotos = photos.filter((p) => p.url !== mainUrl);
  const otherUrls = otherPhotos.length > 0 ? otherPhotos.map((p) => p.url) : [mainUrl];
  // The gallery's 2-col x 4-row grid needs exactly GALLERY_THUMBNAIL_COUNT small squares to
  // stay fully packed (the 8th cell is the "see all" tile) -- cycle through what's actually
  // available to fill it out when an ad has fewer real photos than that.
  const thumbnailUrls = Array.from(
    { length: GALLERY_THUMBNAIL_COUNT },
    (_, i) => otherUrls[i % otherUrls.length],
  );

  const detailSections: DetailSection[] = [
    { headingKey: 'auctionDetail.sections.description', paragraphs: [ad.description] },
  ];
  if (ad.knownFlaws) {
    detailSections.push({
      headingKey: 'auctionDetail.sections.knownFlaws',
      items: ad.knownFlaws.split('\n').filter(Boolean),
    });
  }
  if (ad.modifications) {
    detailSections.push({
      headingKey: 'auctionDetail.sections.modifications',
      items: ad.modifications.split('\n').filter(Boolean),
    });
  }
  if (ad.serviceHistory) {
    detailSections.push({
      headingKey: 'auctionDetail.sections.recentServiceHistory',
      items: ad.serviceHistory.split('\n').filter(Boolean),
    });
  }

  return {
    id: auction.id,
    title: ad.title,
    subtitle: ad.highlights ?? '',
    // No boolean "no reserve" flag exists on Auction -- always defaults to 'reserve'.
    reserveStatus: 'reserve',
    mainPhotoUrl: mainUrl,
    thumbnailUrls,
    totalPhotoCount: photos.length,
    currentBid: auction.currentHighestBid ?? auction.reservePrice,
    buyNowPrice: auction.buyNowPrice,
    sellerId: ad.sellerId,
    state: auction.state,
    // bids is newest-first and each bid must exceed the previous (server-enforced), so the
    // newest is also the current highest bidder.
    bidderName: bids[0]?.bidderName ?? '—',
    sellerName: ad.sellerName ?? `Seller #${ad.sellerId}`,
    sellerType: 'private',
    endDate: new Date(auction.endDate),
    bidsCount: bids.length,
    viewsCount: 0,
    watchingCount: 0,
    specs: {
      make: ad.vehicle.make.name,
      model: ad.vehicle.model.name,
      engine: '—',
      drivetrain: '—',
      mileage: ad.vehicle.mileage ?? 0,
      transmission: '—',
      vin: ad.vehicle.vin ?? '—',
      bodyStyle: '—',
      titleStatus: '—',
      exteriorColor: ad.vehicle.exteriorColor ?? '—',
      interiorColor: ad.vehicle.interiorColor ?? '—',
      location: ad.location ?? '—',
    },
    detailSections,
    videos: [],
    comments: [],
    bids,
  };
}
