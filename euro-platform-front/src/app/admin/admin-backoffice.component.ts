import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';
import { AdService, Ad, AdMessage, AdStatus } from '../ad/ad.service';

const STATUS_SEVERITY: Record<AdStatus, 'secondary' | 'warn' | 'success' | 'danger'> = {
  DRAFT: 'secondary',
  REVIEW: 'warn',
  VALIDATED: 'success',
  REJECTED: 'danger',
};

@Component({
  selector: 'app-admin-backoffice',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputText, InputTextarea, TagModule, TranslatePipe],
  templateUrl: './admin-backoffice.component.html',
})
export class AdminBackofficeComponent {
  private readonly adService = inject(AdService);

  readonly pendingAds = signal<Ad[]>([]);
  readonly loading = signal(true);

  readonly validatingId = signal<number | null>(null);
  readonly rejectingId = signal<number | null>(null);

  // Only one ad's reject form (and message thread) is open at a time.
  readonly rejectDraftAdId = signal<number | null>(null);
  readonly rejectReason = signal('');
  readonly rejectError = signal(false);

  readonly expandedAdId = signal<number | null>(null);
  readonly messagesByAdId = signal<Partial<Record<number, AdMessage[]>>>({});
  readonly loadingMessages = signal(false);
  readonly replyDraft = signal('');
  readonly sendingReply = signal(false);

  constructor() {
    this.adService
      .getPending()
      .then((ads) => this.pendingAds.set(ads))
      .finally(() => this.loading.set(false));
  }

  statusSeverity(status: AdStatus) {
    return STATUS_SEVERITY[status];
  }

  private removeFromPending(adId: number): void {
    this.pendingAds.update((ads) => ads.filter((a) => a.id !== adId));
  }

  async validate(ad: Ad): Promise<void> {
    this.validatingId.set(ad.id);
    try {
      await this.adService.validate(ad.id);
      this.removeFromPending(ad.id);
    } finally {
      this.validatingId.set(null);
    }
  }

  openReject(ad: Ad): void {
    this.rejectDraftAdId.set(ad.id);
    this.rejectReason.set('');
    this.rejectError.set(false);
  }

  cancelReject(): void {
    this.rejectDraftAdId.set(null);
  }

  async confirmReject(ad: Ad): Promise<void> {
    const reason = this.rejectReason().trim();
    if (!reason) {
      this.rejectError.set(true);
      return;
    }

    this.rejectingId.set(ad.id);
    try {
      await this.adService.reject(ad.id, reason);
      this.removeFromPending(ad.id);
      this.rejectDraftAdId.set(null);
    } finally {
      this.rejectingId.set(null);
    }
  }

  async toggleMessages(ad: Ad): Promise<void> {
    if (this.expandedAdId() === ad.id) {
      this.expandedAdId.set(null);
      return;
    }

    this.expandedAdId.set(ad.id);
    this.replyDraft.set('');
    if (!this.messagesByAdId()[ad.id]) {
      this.loadingMessages.set(true);
      try {
        const messages = await this.adService.listMessages(ad.id);
        this.messagesByAdId.update((byId) => ({ ...byId, [ad.id]: messages }));
      } finally {
        this.loadingMessages.set(false);
      }
    }
  }

  async sendReply(ad: Ad): Promise<void> {
    const message = this.replyDraft().trim();
    if (!message) return;

    this.sendingReply.set(true);
    try {
      const created = await this.adService.addMessage(ad.id, message);
      this.messagesByAdId.update((byId) => ({
        ...byId,
        [ad.id]: [...(byId[ad.id] ?? []), created],
      }));
      this.replyDraft.set('');
    } finally {
      this.sendingReply.set(false);
    }
  }
}
