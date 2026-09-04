import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { AdModule } from '../ad/ad.module';
import { AuthModule } from '../auth/auth.module';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { AuctionRepository } from './auction.repository';
import { BidRepository } from './bid.repository';
import { AuctionService } from './auction.service';
import { BidService } from './bid.service';
import { CommissionService } from './commission.service';
import { AuctionController } from './auction.controller';
import { AuctionGateway } from './auction.gateway';

@Module({
  // AdModule is imported (not just Ad re-registered here) so AuctionService can use the
  // already-exported AdRepository for its ownership/status check on launch().
  imports: [TypeOrmModule.forFeature([Auction, Bid]), NotificationModule, AdModule, AuthModule],
  controllers: [AuctionController],
  providers: [
    AuctionService,
    AuctionRepository,
    BidRepository,
    BidService,
    CommissionService,
    AuctionGateway,
  ],
  exports: [AuctionService],
})
export class AuctionModule {}
