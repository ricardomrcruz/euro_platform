import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { Ad } from '../ad/entities/ad.entity';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { AuctionService } from './auction.service';
import { BidService } from './bid.service';
import { CommissionService } from './commission.service';
import { AuctionController } from './auction.controller';

@Module({
  // Ad's repository is reused directly for an ownership/status check, not via AdService.
  imports: [TypeOrmModule.forFeature([Auction, Bid, Ad]), NotificationModule],
  controllers: [AuctionController],
  providers: [AuctionService, BidService, CommissionService],
  exports: [AuctionService],
})
export class AuctionModule {}
