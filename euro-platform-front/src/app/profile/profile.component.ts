import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { AdService } from '../ad/ad.service';
import { Ad, AdStatus } from '../ad/interfaces/ad.interface';
import { AuctionService } from '../auction/auction.service';
import { Auction } from '../auction/interfaces/auction.interface';
import { CountdownComponent } from '../shared/countdown/countdown.component';
import { primaryPhotoUrl } from '../shared/photo.util';

type ProfileTab = 'myAds' | 'myBids' | 'watchlist';

// p-tag severity per ad status -- matches the color language already used for reserve/
// no-reserve tags elsewhere (auction-card, auction-bid-panel).
const STATUS_SEVERITY: Record<AdStatus, 'secondary' | 'warn' | 'success' | 'danger'> = {
  DRAFT: 'secondary',
  REVIEW: 'warn',
  VALIDATED: 'success',
  REJECTED: 'danger',
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ButtonModule,
    TagModule,
    TranslatePipe,
    CountdownComponent,
  ],
  templateUrl: './profile.component.html',
  // PrimeNG's tablist renders its own white background on an internal .p-tablist-tab-list
  // div that isn't reachable via the host element's class list -- override it directly so
  // the tab strip matches the dark panel below it instead of clashing.
  styles: [':host ::ng-deep .p-tablist-tab-list { background: transparent !important; }'],
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly adService = inject(AdService);
  private readonly auctionService = inject(AuctionService);

  readonly currentUser = this.authService.currentUser;

  readonly activeTab = signal<ProfileTab>('myAds');
  readonly myAds = signal<Ad[]>([]);
  readonly loadingMyAds = signal(true);
  readonly submittingAdId = signal<number | null>(null);

  // Keyed by adId -- lets a VALIDATED ad that already has a real LIVE auction show a
  // countdown instead of the "Create Auction" link. Ad has no relation back to Auction on
  // the backend, so this cross-references the public auctions list by ad id; it won't catch
  // a SOLD/EXPIRED/CANCELLED auction for the same ad, a real edge case launch() itself still
  // guards against with a 409.
  readonly liveAuctionByAdId = signal<Partial<Record<number, Auction>>>({});

  readonly statusSeverity = (status: AdStatus) => STATUS_SEVERITY[status];

  constructor() {
    this.adService
      .getMine()
      .then((ads) => this.myAds.set(ads))
      .finally(() => this.loadingMyAds.set(false));

    this.auctionService.listLive().then((auctions) => {
      const byId: Partial<Record<number, Auction>> = {};
      for (const auction of auctions) {
        byId[auction.ad.id] = auction;
      }
      this.liveAuctionByAdId.set(byId);
    });
  }

  async submitForReview(ad: Ad): Promise<void> {
    this.submittingAdId.set(ad.id);
    try {
      const updated = await this.adService.submit(ad.id);
      this.myAds.update((ads) => ads.map((a) => (a.id === updated.id ? updated : a)));
    } finally {
      this.submittingAdId.set(null);
    }
  }

  setActiveTab(value: string | number): void {
    this.activeTab.set(value as ProfileTab);
  }

  endDateOf(auction: Auction): Date {
    return new Date(auction.endDate);
  }

  photoUrl(ad: Ad): string {
    return primaryPhotoUrl(ad.photos, ad.title);
  }
}
