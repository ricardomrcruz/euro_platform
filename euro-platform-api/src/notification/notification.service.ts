import { Injectable, Logger } from '@nestjs/common';

// Design doc 3.1 / 9.3: notifications for the 3 key events (ad validated, outbid, auction
// closed), triggered by the calling service (Observer pattern), not by the entity itself.
// Real email sending needs SMTP credentials we don't have yet -- same "code the structure
// now, real external creds later" pattern as the GCS photo upload. Logged for now.
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  notifyAdValidated(sellerId: number, adTitle: string): void {
    this.logger.log(`[notify] seller ${sellerId}: your ad "${adTitle}" was validated`);
  }

  notifyOutbid(previousBidderId: number, auctionId: number, newAmount: number): void {
    this.logger.log(
      `[notify] bidder ${previousBidderId}: outbid on auction ${auctionId}, new high bid ${newAmount}`,
    );
  }

  notifyAuctionClosed(sellerId: number, auctionId: number, state: string): void {
    this.logger.log(`[notify] seller ${sellerId}: auction ${auctionId} closed as ${state}`);
  }
}
