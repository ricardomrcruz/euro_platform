import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AuctionGalleryComponent } from './gallery/auction-gallery.component';
import { AuctionBidPanelComponent } from './bid-panel/auction-bid-panel.component';
import { AuctionSpecsComponent } from './auction-specs.component';
import { AuctionDetailSectionsComponent } from './auction-detail-sections.component';
import { AuctionVideosComponent } from './auction-videos.component';
import { AuctionBidHistoryComponent } from './bid-history/auction-bid-history.component';
import { AuctionCommentsComponent } from './comments/auction-comments.component';
import { AuctionCardComponent } from '../shared/auction-card/auction-card.component';
import { CountdownComponent } from '../shared/countdown/countdown.component';
import { AuctionDetailData } from './interfaces/auction-detail.interface';
import { AuctionCardData } from '../home/mock-data';
import { AuctionService, toAuctionCardData, toAuctionDetailData } from '../auction/auction.service';

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TranslatePipe,
    AuctionGalleryComponent,
    AuctionBidPanelComponent,
    AuctionSpecsComponent,
    AuctionDetailSectionsComponent,
    AuctionVideosComponent,
    AuctionBidHistoryComponent,
    AuctionCommentsComponent,
    AuctionCardComponent,
    CountdownComponent,
  ],
  templateUrl: './auction-detail.component.html',
})
export class AuctionDetailComponent {
  private readonly auctionService = inject(AuctionService);

  // Bound automatically from the `:id` route segment via withComponentInputBinding(). This is
  // the real Auction's own id (GET /auctions/:id), matching how the homepage routerLinks here.
  id = input<string>('');

  readonly detail = signal<AuctionDetailData | undefined>(undefined);
  readonly otherAuctions = signal<AuctionCardData[]>([]);

  // Bids are stored in the same feed as comments (kind: 'bid') -- the quick-stats bar
  // needs the comment-only count, matching how the reference site tallies them separately.
  readonly commentsOnlyCount = computed(
    () => this.detail()?.comments.filter((c) => c.kind === 'comment').length ?? 0,
  );

  constructor() {
    effect(() => {
      const auctionId = Number(this.id());
      this.loadAuction(auctionId);
    });
  }

  private async loadAuction(auctionId: number): Promise<void> {
    this.detail.set(undefined);
    try {
      const auction = await this.auctionService.getOne(auctionId);
      this.detail.set(toAuctionDetailData(auction));
    } catch {
      this.detail.set(undefined);
      return;
    }

    const live = await this.auctionService.listLive();
    this.otherAuctions.set(
      live
        .filter((a) => a.id !== auctionId)
        .slice(0, 3)
        .map(toAuctionCardData),
    );
  }
}
