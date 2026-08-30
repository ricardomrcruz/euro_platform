import { Injectable } from '@nestjs/common';
import { DataSource, LessThanOrEqual, Repository } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { AuctionState } from './enums/auction-state.enum';

// Mirrors AD_RELATIONS in ad.repository.ts so auction responses carry the same vehicle/photo
// data the ad endpoints already return -- needed by the frontend homepage/detail pages.
const AUCTION_RELATIONS = {
  ad: { vehicle: { make: true, model: true, trim: true }, photos: true },
} as const;

@Injectable()
export class AuctionRepository extends Repository<Auction> {
  constructor(dataSource: DataSource) {
    super(Auction, dataSource.createEntityManager());
  }

  findLive(): Promise<Auction[]> {
    return this.find({
      where: { state: AuctionState.LIVE },
      relations: AUCTION_RELATIONS,
      order: { endDate: 'ASC' },
    });
  }

  findByIdWithRelations(id: number): Promise<Auction | null> {
    return this.findOne({ where: { id }, relations: AUCTION_RELATIONS });
  }

  findExpiredLive(): Promise<Auction[]> {
    return this.find({
      where: { state: AuctionState.LIVE, endDate: LessThanOrEqual(new Date()) },
      relations: AUCTION_RELATIONS,
    });
  }

  findExistingForAd(adId: number): Promise<Auction | null> {
    return this.findOne({ where: { ad: { id: adId } } });
  }
}
