import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuctionCardComponent } from '../../shared/auction-card/auction-card.component';
import { MOCK_AUCTIONS } from '../mock-data';

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
export class AuctionsSectionComponent {
  private readonly translate = inject(TranslateService);

  readonly sortTabs = SORT_TABS;

  // These dropdowns bind their [options] to plain display strings (not value/key pairs),
  // so the option lists themselves have to be re-translated as computed signals whenever
  // the language changes, rather than translated once at template-render time.
  readonly yearOptions = computed(() => this.translateAll(YEAR_OPTION_KEYS));
  readonly transmissionOptions = computed(() => this.translateAll(TRANSMISSION_OPTION_KEYS));
  readonly bodyStyleOptions = computed(() => this.translateAll(BODY_STYLE_OPTION_KEYS));

  readonly activeSort = signal<SortKey>('ending-soon');

  readonly auctions = computed(() => {
    const items = [...MOCK_AUCTIONS];
    switch (this.activeSort()) {
      case 'newly-listed':
        return items.sort((a, b) => b.listedAt.getTime() - a.listedAt.getTime());
      case 'no-reserve':
        return items
          .filter((a) => a.badge === 'NO RESERVE')
          .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
      case 'lowest-mileage':
        return items.sort((a, b) => a.mileage - b.mileage);
      case 'closest-to-me':
        return items;
      case 'ending-soon':
      default:
        return items.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
    }
  });

  selectSort(key: SortKey): void {
    this.activeSort.set(key);
  }

  private translateAll(keys: string[]): string[] {
    this.translate.currentLang();
    return keys.map((key) => this.translate.instant(key));
  }
}
