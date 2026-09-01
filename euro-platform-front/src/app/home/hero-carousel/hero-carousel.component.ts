import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';
import { CountdownComponent } from '../../shared/countdown/countdown.component';
import { AuctionService, toFeaturedCar } from '../../auction/auction.service';
import { FeaturedCar } from '../mock-data';

const ROTATE_INTERVAL_MS = 20_000;
const MAX_FEATURED = 4;

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

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.auctionService.listLive().then((auctions) => {
      this.cars.set(auctions.slice(0, MAX_FEATURED).map(toFeaturedCar));
    });

    this.timer = setInterval(() => {
      const count = this.cars().length;
      if (count > 0) this.index.update((i) => (i + 1) % count);
    }, ROTATE_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
