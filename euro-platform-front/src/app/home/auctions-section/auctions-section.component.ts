import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuctionCardComponent } from '../../shared/auction-card/auction-card.component';
import { AuctionService, toAuctionCardData } from '../../auction/auction.service';
import { AuctionCardData } from '../auction-view-models';

type SortKey = 'ending-soon' | 'newly-listed' | 'no-reserve' | 'lowest-mileage' | 'closest-to-me';

interface SortTab {
  key: SortKey;
  labelKey: string;
}

// 'closest-to-me' is deliberately a no-op -- there's no user location concept in this mock,
// so it just changes which tab looks active rather than faking a distance sort.
const SORT_TABS: SortTab[] = [
  { key: 'ending-soon', labelKey: 'auctions.sort.endingSoon' },
  { key: 'newly-listed', labelKey: 'auctions.sort.newlyListed' },
  { key: 'no-reserve', labelKey: 'auctions.sort.noReserve' },
  { key: 'lowest-mileage', labelKey: 'auctions.sort.lowestMileage' },
  { key: 'closest-to-me', labelKey: 'auctions.sort.closestToMe' },
];

const YEAR_OPTION_KEYS = [
  'auctions.filters.anyYear',
  'auctions.filters.year2020',
  'auctions.filters.year2015',
  'auctions.filters.year2010',
  'auctions.filters.beforeYear2010',
];
const TRANSMISSION_OPTION_KEYS = [
  'auctions.filters.anyTransmission',
  'auctions.filters.manual',
  'auctions.filters.automatic',
];
const BODY_STYLE_OPTION_KEYS = [
  'auctions.filters.anyBodyStyle',
  'auctions.filters.coupe',
  'auctions.filters.sedan',
  'auctions.filters.convertible',
  'auctions.filters.wagon',
  'auctions.filters.suv',
];

@Component({
  selector: 'app-auctions-section',
  standalone: true,
  imports: [CommonModule, Select, AuctionCardComponent, TranslatePipe],
  templateUrl: './auctions-section.component.html',
})
export class AuctionsSectionComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly auctionService = inject(AuctionService);

  readonly sortTabs = SORT_TABS;
  readonly feedAuctions = signal<AuctionCardData[]>([]);

  ngOnInit(): void {
    this.auctionService.listFeed().then((auctions) => {
      this.feedAuctions.set(auctions.map(toAuctionCardData));
    });
  }

  // These dropdowns bind their [options] to plain display strings (not value/key pairs),
  // so the option lists themselves have to be re-translated as computed signals whenever
  // the language changes, rather than translated once at template-render time.
  readonly yearOptions = computed(() => this.translateAll(YEAR_OPTION_KEYS));
  readonly transmissionOptions = computed(() => this.translateAll(TRANSMISSION_OPTION_KEYS));
  readonly bodyStyleOptions = computed(() => this.translateAll(BODY_STYLE_OPTION_KEYS));

  readonly activeSort = signal<SortKey>('ending-soon');

  // Finished auctions always come after live ones, regardless of the active sort tab --
  // the tabs are about browsing what's still biddable, not about ordering the whole feed.
  readonly auctions = computed(() => {
    const live = this.feedAuctions().filter((a) => a.state === 'LIVE');
    const finished = this.feedAuctions()
      .filter((a) => a.state !== 'LIVE')
      .sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

    switch (this.activeSort()) {
      case 'newly-listed':
        live.sort((a, b) => b.listedAt.getTime() - a.listedAt.getTime());
        break;
      case 'no-reserve':
        return live
          .filter((a) => a.badge === 'NO RESERVE')
          .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
      case 'lowest-mileage':
        live.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'closest-to-me':
        break;
      case 'ending-soon':
      default:
        live.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
    }
    return [...live, ...finished];
  });

  selectSort(key: SortKey): void {
    this.activeSort.set(key);
  }

  private translateAll(keys: string[]): string[] {
    this.translate.currentLang();
    return keys.map((key) => this.translate.instant(key));
  }
}
