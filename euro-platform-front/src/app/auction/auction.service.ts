import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuctionCardData, FeaturedCar, placeholder } from '../home/mock-data';
import { AuctionDetailData, DetailSection } from '../auction-detail/interfaces/auction-detail.interface';
import { Auction, AuctionPhoto, LaunchAuctionPayload } from './interfaces/auction.interface';

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
}

function primaryPhotoUrl(photos: AuctionPhoto[], fallbackLabel: string): string {
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  return primary?.url ?? placeholder(fallbackLabel);
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
export function toAuctionDetailData(auction: Auction): AuctionDetailData {
  const { ad } = auction;
  const mainUrl = primaryPhotoUrl(ad.photos, ad.title);
  const photos = [...ad.photos].sort((a, b) => a.sortOrder - b.sortOrder);
  // Exclude whatever's shown as the large hero photo so it isn't repeated in the thumbnail
  // strip -- falls back to repeating it only when there are no other photos at all.
  const otherPhotos = photos.filter((p) => p.url !== mainUrl);
  const thumbnailUrls = otherPhotos.length > 0 ? otherPhotos.map((p) => p.url) : [mainUrl];

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
    // No bids-listing endpoint exists yet to derive a real top-bidder name.
    bidderName: '—',
    // Documented gap: Ad.sellerId is opaque, no cross-service lookup into euro-auth exists.
    sellerName: `Seller #${ad.sellerId}`,
    sellerType: 'private',
    endDate: new Date(auction.endDate),
    bidsCount: 0,
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
  };
}
