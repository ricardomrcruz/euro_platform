import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { AdModule } from '../ad/ad.module';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { AuctionRepository } from './auction.repository';
import { AuctionService } from './auction.service';
import { BidService } from './bid.service';
import { CommissionService } from './commission.service';
import { AuctionController } from './auction.controller';

@Module({
  // AdModule is imported (not just Ad re-registered here) so AuctionService can use the
  // already-exported AdRepository for its ownership/status check on launch().
  imports: [TypeOrmModule.forFeature([Auction, Bid]), NotificationModule, AdModule],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionRepository, BidService, CommissionService],
  exports: [AuctionService],
})
export class AuctionModule {}
