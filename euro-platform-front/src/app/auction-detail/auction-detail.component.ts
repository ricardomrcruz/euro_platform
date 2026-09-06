import { Component, OnDestroy, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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
import { AuctionCardData } from '../home/auction-view-models';
import { AuctionService, toAuctionCardData, toAuctionDetailData } from '../auction/auction.service';
import { AuctionSocketService } from '../auction/auction-socket.service';

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
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './auction-detail.component.html',
})
export class AuctionDetailComponent implements OnDestroy {
  private readonly auctionService = inject(AuctionService);
  private readonly auctionSocket = inject(AuctionSocketService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly datePipe = inject(DatePipe);
  private readonly currencyPipe = inject(CurrencyPipe);

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

  private joinedAuctionId: number | null = null;

  constructor() {
    effect(() => {
      const auctionId = Number(this.id());
      if (this.joinedAuctionId !== null && this.joinedAuctionId !== auctionId) {
        this.auctionSocket.leaveAuction(this.joinedAuctionId);
      }
      this.auctionSocket.joinAuction(auctionId);
      this.joinedAuctionId = auctionId;

      this.detail.set(undefined);
      this.loadAuction(auctionId);
    });

    this.auctionSocket
      .onBidPlaced()
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event.auctionId !== Number(this.id())) return;

        this.messageService.add({
          severity: 'info',
          summary: this.translate.instant('auctionDetail.liveBid.summary'),
          detail: this.translate.instant('auctionDetail.liveBid.detail', {
            name: event.bidderName,
            amount: this.currencyPipe.transform(event.amount, 'EUR', 'symbol', '1.0-0'),
            time: this.datePipe.transform(event.timestamp, 'short'),
          }),
          life: 6000,
        });
        this.refreshAuction();
      });

    this.auctionSocket
      .onAuctionClosed()
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event.auctionId !== Number(this.id())) return;
        this.refreshAuction();
      });
  }

  ngOnDestroy(): void {
    if (this.joinedAuctionId !== null) {
      this.auctionSocket.leaveAuction(this.joinedAuctionId);
    }
  }

  // Re-fetches without clearing detail() first -- used after the bidder's own successful
  // bid/buy-now, and after any live WebSocket event, so the panel updates in place instead of
  // flashing to "not found".
  refreshAuction(): void {
    this.loadAuction(Number(this.id()));
  }

  private async loadAuction(auctionId: number): Promise<void> {
    try {
      const [auction, bids] = await Promise.all([
        this.auctionService.getOne(auctionId),
        this.auctionService.listBids(auctionId),
      ]);
      this.detail.set(toAuctionDetailData(auction, bids));
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
