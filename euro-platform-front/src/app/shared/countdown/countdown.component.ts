import { Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// Matches the reference site's own convention: more than a day left shows day-granularity,
// under a day shows a ticking HH:MM:SS.
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
    const days = Math.floor(totalSeconds / 86400);
    if (days >= 1) {
      const unit = this.translate.instant(days === 1 ? 'countdown.day' : 'countdown.days');
      return `${days} ${unit}`;
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  });

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
