import { Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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
  template: `{{ display() }}`,
})
export class CountdownComponent implements OnDestroy {
  private readonly translate = inject(TranslateService);

  endDate = input.required<Date>();

  private readonly nowMs = signal(Date.now());
  private readonly timer = setInterval(() => this.nowMs.set(Date.now()), 1000);

  readonly display = computed(() => {
    // Read currentLang() so this recomputes (and re-translates) when the user toggles language.
    this.translate.currentLang();

    const remainingMs = this.endDate().getTime() - this.nowMs();
    if (remainingMs <= 0) return this.translate.instant('countdown.ended');

    const totalSeconds = Math.floor(remainingMs / 1000);
    return formatDuration(totalSeconds, (key) => this.translate.instant(key));
  });

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
