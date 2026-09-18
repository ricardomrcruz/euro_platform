import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { CommissionService } from './commission.service';
import { NotificationService } from '../notification/notification.service';
import { AuthClientService } from '../auth/auth-client.service';
import { BidRepository } from './bid.repository';
import { AuctionGateway } from './auction.gateway';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';

const MAX_SERIALIZATION_RETRIES = 3;
const POSTGRES_SERIALIZATION_FAILURE = '40001';

// SERIALIZABLE transactions can abort under contention (code 40001) -- the retry loop is
// required for correctness, not optional. Deliberately not routed through AuctionRepository/
// a BidRepository: every query here must run against this transaction's own EntityManager
// (manager.getRepository(...)), not the app-wide singleton repositories used elsewhere --
// using those instead would silently escape the SERIALIZABLE transaction.
@Injectable()
export class BidService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly commissionService: CommissionService,
    private readonly notificationService: NotificationService,
    private readonly bidRepository: BidRepository,
    private readonly authClient: AuthClientService,
    private readonly auctionGateway: AuctionGateway,
  ) {}

  private async emitBidPlaced(auctionId: number, bid: Bid): Promise<void> {
    const [names, bidsCount] = await Promise.all([
      this.authClient.getPublicNames([bid.bidderId]),
      this.bidRepository.count({ where: { auction: { id: auctionId } } }),
    ]);
    this.auctionGateway.emitBidPlaced(auctionId, {
      auctionId,
      amount: bid.amount,
      bidderName: names[bid.bidderId] ?? `User #${bid.bidderId}`,
      timestamp: bid.timestamp.toISOString(),
      currentHighestBid: bid.amount,
      bidsCount,
    });
  }

  async listBids(auctionId: number): Promise<Bid[]> {
    const bids = await this.bidRepository.findByAuctionOrdered(auctionId);
    const names = await this.authClient.getPublicNames(bids.map((bid) => bid.bidderId));
    for (const bid of bids) {
      bid.bidderName = names[bid.bidderId];
    }
    return bids;
  }

  async placeBid(bidderId: number, auctionId: number, amount: number): Promise<Bid> {
    let previousBidderId: number | undefined;

    const bid = await this.runSerializable(async (manager) => {
      const auctionRepo = manager.getRepository(Auction);
      const bidRepo = manager.getRepository(Bid);

      const auction = await auctionRepo.findOne({
        where: { id: auctionId },
        relations: { ad: true },
      });
      if (!auction) {
        throw new NotFoundException('Auction not found');
      }
      if (auction.ad.sellerId === bidderId) {
        throw new ForbiddenException('Cannot bid on your own auction');
      }

      const previousTopBid = await bidRepo.findOne({
        where: { auction: { id: auctionId } },
        order: { amount: 'DESC' },
      });
      previousBidderId = previousTopBid?.bidderId;

      auction.registerBid(amount);
      await auctionRepo.save(auction);

      const commission = this.commissionService.calculate(amount);
      return bidRepo.save(
        bidRepo.create({ auction, amount, commission, timestamp: new Date(), bidderId }),
      );
    });

    if (previousBidderId && previousBidderId !== bidderId) {
      this.notificationService.notifyOutbid(previousBidderId, auctionId, amount);
    }
    await this.emitBidPlaced(auctionId, bid);

    return bid;
  }

  async buyNow(bidderId: number, auctionId: number): Promise<Bid> {
    const result = await this.runSerializable(async (manager) => {
      const auctionRepo = manager.getRepository(Auction);
      const bidRepo = manager.getRepository(Bid);

      const auction = await auctionRepo.findOne({
        where: { id: auctionId },
        relations: { ad: true },
      });
      if (!auction) {
        throw new NotFoundException('Auction not found');
      }
      if (auction.ad.sellerId === bidderId) {
        throw new ForbiddenException('Cannot buy your own auction');
      }
      if (!auction.buyNowPrice) {
        throw new BadRequestException('This auction has no buy-now price');
      }

      const amount = auction.buyNowPrice;
      auction.currentHighestBid = amount;
      auction.sell();
      auction.closedAt = new Date();
      await auctionRepo.save(auction);

      const commission = this.commissionService.calculate(amount);
      const bid = await bidRepo.save(
        bidRepo.create({ auction, amount, commission, timestamp: new Date(), bidderId }),
      );

      return { bid, sellerId: auction.ad.sellerId, state: auction.state };
    });

    this.notificationService.notifyAuctionClosed(result.sellerId, auctionId, result.state);
    await this.emitBidPlaced(auctionId, result.bid);
    this.auctionGateway.emitAuctionClosed(auctionId, { auctionId, state: result.state });
    return result.bid;
  }

  private async runSerializable<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= MAX_SERIALIZATION_RETRIES; attempt++) {
      try {
        return await this.dataSource.transaction('SERIALIZABLE', work);
      } catch (error) {
        const isSerializationFailure =
          (error as { code?: string }).code === POSTGRES_SERIALIZATION_FAILURE;
        if (!isSerializationFailure || attempt === MAX_SERIALIZATION_RETRIES) {
          throw error;
        }
      }
    }
    throw new Error('Unreachable');
  }
}
