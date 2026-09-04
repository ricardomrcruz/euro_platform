import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import type { Bid } from '../../auction/interfaces/auction.interface';

@Component({
  selector: 'app-auction-bid-history',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './auction-bid-history.component.html',
})
export class AuctionBidHistoryComponent {
  // Real bids, newest first (see AuctionService.listBids) -- no longer derived from the mock
  // comment feed.
  bids = input.required<Bid[]>();
}
