import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Ad } from '../ad/entities/ad.entity';
import { AdStatus } from '../ad/enums/ad-status.enum';
import { UserRole } from '../auth/enums/user-role.enum';
import type { RequestUser } from '../auth/interfaces/authenticated-request.interface';
import { NotificationService } from '../notification/notification.service';
import { Auction } from './entities/auction.entity';
import { AuctionState } from './enums/auction-state.enum';
import { LaunchAuctionDto } from './dto/launch-auction.dto';

// Lifecycle only; bidding and buy-now live in BidService.
@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>,
    private readonly notificationService: NotificationService,
  ) {}

  async launch(currentUser: RequestUser, adId: number, dto: LaunchAuctionDto): Promise<Auction> {
    const ad = await this.adRepository.findOneBy({ id: adId });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.status !== AdStatus.VALIDATED) {
      throw new BadRequestException('Ad must be validated before launching an auction');
    }
    if (ad.sellerId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to launch an auction for this ad');
    }

    const existing = await this.auctionRepository.findOne({ where: { ad: { id: adId } } });
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
    return saved;
  }

  // Called by SchedulerService's @Cron, not directly by any controller.
  async closeExpired(): Promise<void> {
    const expired = await this.auctionRepository.find({
      where: { state: AuctionState.LIVE, endDate: LessThanOrEqual(new Date()) },
      relations: { ad: true },
    });

    for (const auction of expired) {
      auction.finalize();
      const saved = await this.auctionRepository.save(auction);
      this.notificationService.notifyAuctionClosed(auction.ad.sellerId, saved.id, saved.state);
    }
  }

  listLive(): Promise<Auction[]> {
    return this.auctionRepository.find({
      where: { state: AuctionState.LIVE },
      relations: { ad: true },
      order: { endDate: 'ASC' },
    });
  }

  findOne(id: number): Promise<Auction> {
    return this.findByIdOrThrow(id);
  }

  private async findByIdOrThrow(id: number): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: { ad: true },
    });
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    return auction;
  }
}
