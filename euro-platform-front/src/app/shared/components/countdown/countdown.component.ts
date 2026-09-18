import { Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import type { AuctionState } from '../../../auction/interfaces/auction.interface';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY;

// Always ticks live, second by second. Weeks/days/hours only appear once relevant (no leading
// zero units); minutes/seconds always show, matching the "real time" countdown the reference
// site uses.
function formatDuration(totalSeconds: number, t: (key: string) => string): string {
  let remaining = totalSeconds;
  const weeks = Math.floor(remaining / SECONDS_PER_WEEK);
  remaining %= SECONDS_PER_WEEK;
  const days = Math.floor(remaining / SECONDS_PER_DAY);
  remaining %= SECONDS_PER_DAY;
  const hours = Math.floor(remaining / SECONDS_PER_HOUR);
  remaining %= SECONDS_PER_HOUR;
  const minutes = Math.floor(remaining / SECONDS_PER_MINUTE);
  const seconds = remaining % SECONDS_PER_MINUTE;

  const parts: string[] = [];
  if (weeks > 0) parts.push(`${weeks}${t('countdown.weekAbbr')}`);
  if (weeks > 0 || days > 0) parts.push(`${days}${t('countdown.dayAbbr')}`);
  if (weeks > 0 || days > 0 || hours > 0) parts.push(`${hours}${t('countdown.hourAbbr')}`);
  parts.push(`${minutes}${t('countdown.minuteAbbr')}`);
  parts.push(`${seconds}${t('countdown.secondAbbr')}`);
  return parts.join(' ');
}

@Component({
  selector: 'app-countdown',
  standalone: true,
  providers: [DatePipe],
  template: `{{ display() }}`,
})
export class CountdownComponent implements OnDestroy {
  private readonly translate = inject(TranslateService);
  private readonly datePipe = inject(DatePipe);

  endDate = input.required<Date>();
  // Optional -- when provided and not LIVE, the countdown stops immediately (e.g. a buy-now
  // sale doesn't change endDate, so without this it would keep counting toward a date the
  // auction already closed well ahead of).
  state = input<AuctionState>();
  // Only set for a buy-now close -- shown instead of endDate once ended, since endDate would
  // still be the original scheduled date, not when it actually sold.
  closedAt = input<Date>();

  private readonly nowMs = signal(Date.now());
  private readonly timer = setInterval(() => this.nowMs.set(Date.now()), 1000);

  readonly display = computed(() => {
    // Read currentLang() so this recomputes (and re-translates) when the user toggles language.
    this.translate.currentLang();

    const state = this.state();
    const remainingMs = this.endDate().getTime() - this.nowMs();
    if ((state && state !== 'LIVE') || remainingMs <= 0) {
      const date = this.datePipe.transform(this.closedAt() ?? this.endDate(), 'short');
      return this.translate.instant('countdown.endedOn', { date });
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    return formatDuration(totalSeconds, (key) => this.translate.instant(key));
  });

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
