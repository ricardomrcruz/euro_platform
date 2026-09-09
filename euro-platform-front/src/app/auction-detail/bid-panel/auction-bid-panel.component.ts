import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CountdownComponent } from '../../shared/components/countdown/countdown.component';
import { AuthService } from '../../core/auth/auth.service';
import { AuctionService } from '../../auction/auction.service';
import type { AuctionDetailData } from '../interfaces/auction-detail.interface';

// Suggested step above whatever's currently shown as the price (itself already the highest
// real bid, or the reserve price when there isn't one yet -- see toAuctionDetailData) -- just
// a client-side hint for a sensible next amount, never lower than what's already displayed.
// The server's own response is always the authoritative minimum.
const SUGGESTED_BID_STEP = 500;

@Component({
  selector: 'app-auction-bid-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule, InputText, TranslatePipe, CountdownComponent],
  templateUrl: './auction-bid-panel.component.html',
})
export class AuctionBidPanelComponent {
  private readonly auctionService = inject(AuctionService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  detail = input.required<AuctionDetailData>();
  // Fires after a successful bid/buy-now so the parent page can refresh the auction + bid list.
  bidPlaced = output<void>();

  readonly currentUser = this.authService.currentUser;
  readonly isLoggedIn = this.authService.isLoggedIn;

  readonly bidAmount = signal<number | null>(null);
  readonly placingBid = signal(false);
  readonly buyingNow = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isSeller = computed(() => this.currentUser()?.sub === this.detail().sellerId);
  readonly isLive = computed(() => this.detail().state === 'LIVE');
  readonly canBid = computed(() => this.isLoggedIn() && !this.isSeller() && this.isLive());
  readonly minNextBid = computed(() => this.detail().currentBid + SUGGESTED_BID_STEP);

  openLogin(): void {
    this.authService.openLoginDialog();
  }

  async placeBid(): Promise<void> {
    const amount = this.bidAmount();
    if (!amount || amount < this.minNextBid()) {
      this.errorMessage.set(
        this.translate.instant('auctionDetail.bidPanel.minBidError', { min: this.minNextBid() }),
      );
      return;
    }

    this.placingBid.set(true);
    this.errorMessage.set(null);
    try {
      await this.auctionService.placeBid(this.detail().id, amount);
      this.bidAmount.set(null);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('auctionDetail.bidPanel.bidPlacedSummary'),
        life: 4000,
      });
      this.bidPlaced.emit();
    } catch (error) {
      this.errorMessage.set(this.extractErrorMessage(error));
    } finally {
      this.placingBid.set(false);
    }
  }

  async buyNow(): Promise<void> {
    this.buyingNow.set(true);
    this.errorMessage.set(null);
    try {
      await this.auctionService.buyNow(this.detail().id);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('auctionDetail.bidPanel.boughtSummary'),
        life: 4000,
      });
      this.bidPlaced.emit();
    } catch (error) {
      this.errorMessage.set(this.extractErrorMessage(error));
    } finally {
      this.buyingNow.set(false);
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join(', ');
    }
    return this.translate.instant('auctionDetail.bidPanel.genericError');
  }
}
