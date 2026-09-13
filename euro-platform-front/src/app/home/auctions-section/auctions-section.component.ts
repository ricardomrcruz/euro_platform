import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { TranslatePipe } from '@ngx-translate/core';
import { AuctionCardComponent } from '../../shared/components/auction-card/auction-card.component';
import { AuctionService } from '../../auction/auction.service';
import { toAuctionCardData } from '../../auction/auction.mappers';
import { AuctionCardData } from '../../shared/models/auction.model';

type SortKey = 'ending-soon' | 'newly-listed' | 'no-reserve' | 'lowest-mileage' | 'closest-to-me';

interface SortTab {
  key: SortKey;
  labelKey: string;
}

interface FilterOption {
  value: string;
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

// Non-overlapping year buckets, matching the existing label text exactly ("2020+",
// "2015-2019", "2010-2014", "Before 2010") -- not an open-ended ">= threshold" filter.
const YEAR_FILTER_OPTIONS: FilterOption[] = [
  { value: '2020+', labelKey: 'auctions.filters.year2020' },
  { value: '2015-2019', labelKey: 'auctions.filters.year2015' },
  { value: '2010-2014', labelKey: 'auctions.filters.year2010' },
  { value: 'before2010', labelKey: 'auctions.filters.beforeYear2010' },
];

// CVT/SEMI_AUTOMATIC fold into "Automatic" here -- this is a simplified 2-way filter, not a
// full transmission-type breakdown (that granularity exists on the /auctions filter sidebar).
const TRANSMISSION_FILTER_OPTIONS: FilterOption[] = [
  { value: 'MANUAL', labelKey: 'auctions.filters.manual' },
  { value: 'AUTOMATIC', labelKey: 'auctions.filters.automatic' },
];

const BODY_STYLE_FILTER_OPTIONS: FilterOption[] = [
  { value: 'COUPE', labelKey: 'auctions.filters.coupe' },
  { value: 'SEDAN', labelKey: 'auctions.filters.sedan' },
  { value: 'CONVERTIBLE', labelKey: 'auctions.filters.convertible' },
  { value: 'WAGON', labelKey: 'auctions.filters.wagon' },
  { value: 'SUV', labelKey: 'auctions.filters.suv' },
];

@Component({
  selector: 'app-auctions-section',
  standalone: true,
  imports: [CommonModule, FormsModule, Select, AuctionCardComponent, TranslatePipe],
  templateUrl: './auctions-section.component.html',
})
export class AuctionsSectionComponent implements OnInit {
  private readonly auctionService = inject(AuctionService);

  readonly sortTabs = SORT_TABS;
  readonly feedAuctions = signal<AuctionCardData[]>([]);

  ngOnInit(): void {
    this.auctionService.listFeed().then((auctions) => {
      this.feedAuctions.set(auctions.map(toAuctionCardData));
    });
  }

  readonly yearOptions = YEAR_FILTER_OPTIONS;
  readonly transmissionOptions = TRANSMISSION_FILTER_OPTIONS;
  readonly bodyStyleOptions = BODY_STYLE_FILTER_OPTIONS;

  readonly selectedYearBucket = signal<string | null>(null);
  readonly selectedTransmission = signal<string | null>(null);
  readonly selectedBodyStyle = signal<string | null>(null);

  readonly activeSort = signal<SortKey>('ending-soon');

  // Finished auctions always come after live ones, regardless of the active sort tab --
  // the tabs are about browsing what's still biddable, not about ordering the whole feed.
  readonly auctions = computed(() => {
    const filtered = this.feedAuctions().filter((a) => this.matchesFilters(a));
    const live = filtered.filter((a) => a.state === 'LIVE');
    const finished = filtered
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

  private matchesFilters(auction: AuctionCardData): boolean {
    const yearBucket = this.selectedYearBucket();
    if (yearBucket) {
      const year = auction.year;
      if (yearBucket === '2020+' && year < 2020) return false;
      if (yearBucket === '2015-2019' && (year < 2015 || year > 2019)) return false;
      if (yearBucket === '2010-2014' && (year < 2010 || year > 2014)) return false;
      if (yearBucket === 'before2010' && year >= 2010) return false;
    }

    const transmission = this.selectedTransmission();
    if (transmission) {
      const isManual = auction.transmission === 'MANUAL';
      if (transmission === 'MANUAL' && !isManual) return false;
      if (transmission === 'AUTOMATIC' && (isManual || !auction.transmission)) return false;
    }

    const bodyStyle = this.selectedBodyStyle();
    if (bodyStyle && auction.bodyType !== bodyStyle) return false;

    return true;
  }
}
