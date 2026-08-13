import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';
import { CountdownComponent } from '../../shared/countdown/countdown.component';
import { FEATURED_CARS } from '../mock-data';

const ROTATE_INTERVAL_MS = 20_000;

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, TagModule, CountdownComponent, TranslatePipe],
  templateUrl: './hero-carousel.component.html',
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  readonly cars = FEATURED_CARS;
  readonly index = signal(0);

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.index.update((i) => (i + 1) % this.cars.length);
    }, ROTATE_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
