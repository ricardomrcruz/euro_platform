import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuctionCardData, FeaturedCar, placeholder } from '../home/mock-data';
import { AuctionDetailData, DetailSection } from '../auction-detail/interfaces/auction-detail.interface';
import { Auction, Bid, LaunchAuctionPayload } from './interfaces/auction.interface';
import { primaryPhotoUrl } from '../shared/photo.util';

// Matches AuctionGalleryComponent's fixed 2-col x 4-row thumbnail grid (7 photo cells + 1
// "see all" cell).
const GALLERY_THUMBNAIL_COUNT = 7;

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
