import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import type { CommentItem } from '../mock-detail-data';

@Component({
  selector: 'app-auction-bid-history',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './auction-bid-history.component.html',
})
export class AuctionBidHistoryComponent {
  // Reuses the same comment feed data (bids are just comments with kind: 'bid') rather
  // than a separate dataset, since the two would otherwise drift out of sync.
  comments = input.required<CommentItem[]>();

  readonly bids = computed(() => this.comments().filter((c) => c.kind === 'bid'));
}
