import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionService } from '../auction/auction.service';

// Design doc 6.3.5 note: "le @Cron declenche la methode toutes les minutes."
@Injectable()
export class SchedulerService {
  constructor(private readonly auctionService: AuctionService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredAuctions(): Promise<void> {
    await this.auctionService.closeExpired();
  }
}
