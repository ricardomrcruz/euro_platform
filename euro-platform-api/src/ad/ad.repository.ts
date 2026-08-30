import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Ad } from './entities/ad.entity';
import { AdStatus } from './enums/ad-status.enum';

// Cap on active (DRAFT/REVIEW/VALIDATED) ads per seller.
const ACTIVE_STATUSES = [AdStatus.DRAFT, AdStatus.REVIEW, AdStatus.VALIDATED];

const AD_RELATIONS = {
  vehicle: { make: true, model: true, trim: true },
  photos: true,
} as const;

@Injectable()
export class AdRepository extends Repository<Ad> {
  constructor(dataSource: DataSource) {
    super(Ad, dataSource.createEntityManager());
  }

  countActiveForSeller(sellerId: number): Promise<number> {
    return this.count({ where: { sellerId, status: In(ACTIVE_STATUSES) } });
  }

  // No relations -- used where only the ad's own columns (status, sellerId) are needed,
  // e.g. AuctionService's launch() guard.
  findById(id: number): Promise<Ad | null> {
    return this.findOneBy({ id });
  }

  findByIdWithRelations(id: number): Promise<Ad | null> {
    return this.findOne({ where: { id }, relations: AD_RELATIONS });
  }

  findValidatedOrdered(): Promise<Ad[]> {
    return this.find({
      where: { status: AdStatus.VALIDATED },
      relations: AD_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  findBySeller(sellerId: number): Promise<Ad[]> {
    return this.find({ where: { sellerId }, relations: AD_RELATIONS, order: { createdAt: 'DESC' } });
  }

  findPendingReview(): Promise<Ad[]> {
    return this.find({
      where: { status: AdStatus.REVIEW },
      relations: AD_RELATIONS,
      order: { createdAt: 'ASC' },
    });
  }
}
