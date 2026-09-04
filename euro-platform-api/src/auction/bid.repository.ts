import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Bid } from './entities/bid.entity';

// A plain read-side repository, deliberately separate from BidService's SERIALIZABLE
// transaction manager -- listBids() isn't part of a bid-placing transaction.
@Injectable()
export class BidRepository extends Repository<Bid> {
  constructor(dataSource: DataSource) {
    super(Bid, dataSource.createEntityManager());
  }

  findByAuctionOrdered(auctionId: number): Promise<Bid[]> {
    return this.find({
      where: { auction: { id: auctionId } },
      order: { timestamp: 'DESC' },
    });
  }
}
