import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';
import { CountdownComponent } from '../../shared/countdown/countdown.component';
import { AuctionService, toFeaturedCar } from '../../auction/auction.service';
import { FeaturedCar } from '../auction-view-models';

const ROTATE_INTERVAL_MS = 20_000;
const MAX_FEATURED = 4;
// Brief fade-to-transparent before swapping the photo, then fade back in -- avoids the hard
// cut of just swapping `img[src]` in place, without needing to layer two images to crossfade.
const FADE_MS = 200;

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, TagModule, CountdownComponent, TranslatePipe],
  templateUrl: './hero-carousel.component.html',
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  private readonly auctionService = inject(AuctionService);

  readonly cars = signal<FeaturedCar[]>([]);
  readonly index = signal(0);
  readonly fading = signal(false);

  private timer?: ReturnType<typeof setInterval>;
  private fadeTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.auctionService.listLive().then((auctions) => {
      this.cars.set(auctions.slice(0, MAX_FEATURED).map(toFeaturedCar));
    });

    this.timer = setInterval(() => {
      const count = this.cars().length;
      if (count === 0) return;

      this.fading.set(true);
      this.fadeTimeout = setTimeout(() => {
        this.index.update((i) => (i + 1) % count);
        this.fading.set(false);
      }, FADE_MS);
    }, ROTATE_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    clearTimeout(this.fadeTimeout);
  }
}
