import { Component, computed, input } from '@angular/core';
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
import { getAuctionDetail } from './mock-detail-data';
import { MOCK_AUCTIONS } from '../home/mock-data';

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
  // Bound automatically from the `:id` route segment via withComponentInputBinding().
  id = input<string>('');

  readonly detail = computed(() => getAuctionDetail(Number(this.id())));

  readonly otherAuctions = computed(() => {
    const currentId = Number(this.id());
    return MOCK_AUCTIONS.filter((a) => a.id !== currentId).slice(0, 3);
  });

  // Bids are stored in the same feed as comments (kind: 'bid') -- the quick-stats bar
  // needs the comment-only count, matching how the reference site tallies them separately.
  readonly commentsOnlyCount = computed(
    () => this.detail()?.comments.filter((c) => c.kind === 'comment').length ?? 0,
  );
}
