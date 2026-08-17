import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { AdService, Ad, AdStatus } from '../ad/ad.service';
import { AuctionService } from '../auction/auction.service';
import { calculateCommission } from '../auction/commission.util';

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
    ReactiveFormsModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ButtonModule,
    TagModule,
    InputText,
    TranslatePipe,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly adService = inject(AdService);
  private readonly auctionService = inject(AuctionService);
  private readonly fb = inject(FormBuilder);

  readonly currentUser = this.authService.currentUser;

  readonly activeTab = signal<ProfileTab>('myAds');
  readonly myAds = signal<Ad[]>([]);
  readonly loadingMyAds = signal(true);
  readonly submittingAdId = signal<number | null>(null);

  // Only one ad's launch-auction panel is open at a time.
  readonly launchDraftAdId = signal<number | null>(null);
  readonly launching = signal(false);
  readonly launchErrorKey = signal<string | null>(null);

  readonly launchForm = this.fb.group({
    endDate: ['', Validators.required],
    reservePrice: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    buyNowPrice: this.fb.control<number | null>(null, Validators.min(1)),
  });

  // Buy Now Price is the only field with a concrete, guaranteed sale amount -- the reserve
  // is just a bidding floor, not itself a price the buyer would actually pay.
  private readonly buyNowPriceValue = signal<number | null>(null);
  readonly commissionPreview = computed(() => {
    const price = this.buyNowPriceValue();
    return price && price > 0 ? calculateCommission(price) : null;
  });
  readonly totalForBuyerPreview = computed(() => {
    const price = this.buyNowPriceValue();
    const commission = this.commissionPreview();
    return price && commission ? price + commission : null;
  });

  readonly statusSeverity = (status: AdStatus) => STATUS_SEVERITY[status];

  constructor() {
    this.adService
      .getMine()
      .then((ads) => this.myAds.set(ads))
      .finally(() => this.loadingMyAds.set(false));

    this.launchForm.controls.buyNowPrice.valueChanges.subscribe((value) => {
      this.buyNowPriceValue.set(value);
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

  openLaunch(ad: Ad): void {
    this.launchDraftAdId.set(ad.id);
    this.launchForm.reset();
    this.launchErrorKey.set(null);
  }

  cancelLaunch(): void {
    this.launchDraftAdId.set(null);
  }

  async confirmLaunch(ad: Ad): Promise<void> {
    if (this.launchForm.invalid) {
      this.launchForm.markAllAsTouched();
      return;
    }

    const { endDate, reservePrice, buyNowPrice } = this.launchForm.getRawValue();
    this.launching.set(true);
    this.launchErrorKey.set(null);
    try {
      await this.auctionService.launch(ad.id, {
        endDate: new Date(endDate!).toISOString(),
        reservePrice: reservePrice!,
        buyNowPrice: buyNowPrice ?? undefined,
      });
      this.launchDraftAdId.set(null);
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      this.launchErrorKey.set(
        status === 409 ? 'profile.myAds.launch.alreadyLaunchedError' : 'profile.myAds.launch.genericError',
      );
    } finally {
      this.launching.set(false);
    }
  }

  setActiveTab(value: string | number): void {
    this.activeTab.set(value as ProfileTab);
  }
}
