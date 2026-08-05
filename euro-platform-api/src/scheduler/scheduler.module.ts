import { Module } from '@nestjs/common';
import { AuctionModule } from '../auction/auction.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [AuctionModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
