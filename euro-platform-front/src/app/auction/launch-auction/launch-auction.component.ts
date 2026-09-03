import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Image } from 'primeng/image';
import { MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdService, Ad } from '../../ad/ad.service';
import { AuctionService } from '../auction.service';
import { calculateCommission, COMMISSION_RATE, MIN_COMMISSION, MAX_COMMISSION } from '../commission.util';

@Component({
  selector: 'app-launch-auction',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    DatePicker,
    ButtonModule,
    InputText,
    Image,
    TranslatePipe,
  ],
  templateUrl: './launch-auction.component.html',
})
export class LaunchAuctionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adService = inject(AdService);
  private readonly auctionService = inject(AuctionService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly ad = signal<Ad | null>(null);
  readonly loading = signal(true);
  readonly launching = signal(false);
  readonly errorKey = signal<string | null>(null);

  // Can't pick an end date in the past.
  readonly minDate = new Date();

  readonly form = this.fb.group({
    endDate: this.fb.control<Date | null>(null, Validators.required),
    reservePrice: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    buyNowPrice: this.fb.control<number | null>(null, Validators.min(1)),
  });

  // Plain-language commission-rule constants for the always-visible explanation text --
  // sourced from commission.util.ts so the displayed numbers can never drift from the actual
  // calculation logic.
  readonly commissionRatePercent = COMMISSION_RATE * 100;
  readonly minCommission = MIN_COMMISSION;
  readonly maxCommission = MAX_COMMISSION;

  // Buy Now Price has a concrete, guaranteed sale amount -- shown as a firm total-for-buyer.
  // Reserve Price is just a bidding floor, so its preview is shown separately as an estimate
  // (the real commission is only known once the auction closes on the winning bid).
  private readonly buyNowPriceValue = signal<number | null>(null);
  private readonly reservePriceValue = signal<number | null>(null);

  readonly commissionPreview = computed(() => {
    const price = this.buyNowPriceValue();
    return price && price > 0 ? calculateCommission(price) : null;
  });
  readonly totalForBuyerPreview = computed(() => {
    const price = this.buyNowPriceValue();
    const commission = this.commissionPreview();
    return price && commission ? price + commission : null;
  });
  readonly reserveCommissionPreview = computed(() => {
    const price = this.reservePriceValue();
    return price && price > 0 ? calculateCommission(price) : null;
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.adService
      .getOne(id)
      .then((ad) => this.ad.set(ad))
      .finally(() => this.loading.set(false));

    this.form.controls.buyNowPrice.valueChanges.subscribe((value) => {
      this.buyNowPriceValue.set(value);
    });
    this.form.controls.reservePrice.valueChanges.subscribe((value) => {
      this.reservePriceValue.set(value);
    });
  }

  async launch(): Promise<void> {
    const ad = this.ad();
    if (!ad || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { endDate, reservePrice, buyNowPrice } = this.form.getRawValue();
    this.launching.set(true);
    this.errorKey.set(null);
    try {
      await this.auctionService.launch(ad.id, {
        endDate: endDate!.toISOString(),
        reservePrice: reservePrice!,
        buyNowPrice: buyNowPrice ?? undefined,
      });
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('profile.myAds.launch.toastSummary'),
        detail: this.translate.instant('profile.myAds.launch.toastDetail'),
        life: 5000,
      });
      this.router.navigateByUrl('/profile');
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      this.errorKey.set(
        status === 409
          ? 'profile.myAds.launch.alreadyLaunchedError'
          : 'profile.myAds.launch.genericError',
      );
    } finally {
      this.launching.set(false);
    }
  }
}
