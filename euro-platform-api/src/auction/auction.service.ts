import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdRepository } from '../ad/ad.repository';
import { AdStatus } from '../ad/enums/ad-status.enum';
import { UserRole } from '../auth/enums/user-role.enum';
import type { RequestUser } from '../auth/interfaces/authenticated-request.interface';
import { AuthClientService } from '../auth/auth-client.service';
import { NotificationService } from '../notification/notification.service';
import { AuctionRepository } from './auction.repository';
import { AuctionGateway } from './auction.gateway';
import { Auction } from './entities/auction.entity';
import { LaunchAuctionDto } from './dto/launch-auction.dto';
import { SearchAuctionsDto } from './dto/search-auctions.dto';

const FEED_FINISHED_WINDOW_DAYS = 14;

// Lifecycle only; bidding and buy-now live in BidService.
@Injectable()
export class AuctionService {
  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly adRepository: AdRepository,
    private readonly notificationService: NotificationService,
    private readonly authClient: AuthClientService,
    private readonly auctionGateway: AuctionGateway,
  ) {}

  async launch(currentUser: RequestUser, adId: number, dto: LaunchAuctionDto): Promise<Auction> {
    const ad = await this.adRepository.findById(adId);
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.status !== AdStatus.VALIDATED) {
      throw new BadRequestException('Ad must be validated before launching an auction');
    }
    if (ad.sellerId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to launch an auction for this ad');
    }

    const existing = await this.auctionRepository.findExistingForAd(adId);
    if (existing) {
      throw new ConflictException('An auction already exists for this ad');
    }

    const auction = this.auctionRepository.create({
      ad,
      startDate: new Date(),
      endDate: new Date(dto.endDate),
      reservePrice: dto.reservePrice,
      buyNowPrice: dto.buyNowPrice,
    });
    return this.auctionRepository.save(auction);
  }

  async endManually(currentUser: RequestUser, auctionId: number): Promise<Auction> {
    const auction = await this.findByIdOrThrow(auctionId);
    if (auction.ad.sellerId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to end this auction');
    }

    // No bids yet means the seller is just pulling the listing.
    if (auction.currentHighestBid == null) {
      auction.cancel();
    } else {
      auction.finalize();
    }

    const saved = await this.auctionRepository.save(auction);
    this.notificationService.notifyAuctionClosed(auction.ad.sellerId, saved.id, saved.state);
    this.auctionGateway.emitAuctionClosed(saved.id, { auctionId: saved.id, state: saved.state });
    return saved;
  }

  // Called by SchedulerService's @Cron, not directly by any controller.
  async closeExpired(): Promise<void> {
    const expired = await this.auctionRepository.findExpiredLive();

    for (const auction of expired) {
      auction.finalize();
      const saved = await this.auctionRepository.save(auction);
      this.notificationService.notifyAuctionClosed(auction.ad.sellerId, saved.id, saved.state);
      this.auctionGateway.emitAuctionClosed(saved.id, { auctionId: saved.id, state: saved.state });
    }
  }

  async listLive(): Promise<Auction[]> {
    const auctions = await this.auctionRepository.findLive();
    await this.resolveSellerNames(auctions);
    return auctions;
  }

  // Live auctions, then anything that finished within the last two weeks -- what the
  // homepage shows. Older finished auctions still exist, just not here (see listHistory()).
  async listFeed(): Promise<Auction[]> {
    const cutoff = new Date(Date.now() - FEED_FINISHED_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const [live, recentlyFinished] = await Promise.all([
      this.auctionRepository.findLive(),
      this.auctionRepository.findFinishedSince(cutoff),
    ]);
    const combined = [...live, ...recentlyFinished];
    await this.resolveSellerNames(combined);
    return combined;
  }

  // Every auction matching the given filters (all optional), live ones first (by
  // soonest-ending), then every finished match (most-recently-ended first). Called with no
  // filters at all, this is every auction ever -- the browse page's unfiltered default.
  async search(filters: SearchAuctionsDto): Promise<Auction[]> {
    const auctions = await this.auctionRepository.searchAuctions(filters);
    await this.resolveSellerNames(auctions);
    return auctions;
  }

  async findOne(id: number): Promise<Auction> {
    const auction = await this.findByIdOrThrow(id);
    await this.resolveSellerNames([auction]);
    return auction;
  }

  private async findByIdOrThrow(id: number): Promise<Auction> {
    const auction = await this.auctionRepository.findByIdWithRelations(id);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    return auction;
  }

  // Batched so a homepage-sized list of auctions costs one euro-auth call, not one per ad.
  private async resolveSellerNames(auctions: Auction[]): Promise<void> {
    const sellerIds = auctions.map((auction) => auction.ad.sellerId);
    const names = await this.authClient.getPublicNames(sellerIds);
    for (const auction of auctions) {
      auction.ad.sellerName = names[auction.ad.sellerId];
    }
  }
}
