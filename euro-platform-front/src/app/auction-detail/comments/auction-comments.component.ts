import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import type { CommentItem, SortKey, SortTab } from '../interfaces/auction-detail.interface';

const SORT_TABS: SortTab[] = [
  { key: 'newest', labelKey: 'auctionDetail.comments.sortNewest' },
  { key: 'most-upvoted', labelKey: 'auctionDetail.comments.sortMostUpvoted' },
  { key: 'seller-comments', labelKey: 'auctionDetail.comments.sortSellerComments' },
  { key: 'bid-history', labelKey: 'auctionDetail.comments.sortBidHistory' },
];

@Component({
  selector: 'app-auction-comments',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputText, TranslatePipe],
  templateUrl: './auction-comments.component.html',
})
export class AuctionCommentsComponent {
  comments = input.required<CommentItem[]>();

  readonly sortTabs = SORT_TABS;
  readonly activeSort = signal<SortKey>('newest');

  readonly visibleComments = computed(() => {
    const items = [...this.comments()];
    switch (this.activeSort()) {
      case 'most-upvoted':
        return items.sort((a, b) => b.upvotes - a.upvotes);
      case 'seller-comments':
        return items.filter((c) => c.isSeller);
      case 'bid-history':
        return items.filter((c) => c.kind === 'bid');
      case 'newest':
      default:
        return items;
    }
  });

  selectSort(key: SortKey): void {
    this.activeSort.set(key);
  }

  initials(author: string): string {
    return author.slice(0, 2).toUpperCase();
  }
}
