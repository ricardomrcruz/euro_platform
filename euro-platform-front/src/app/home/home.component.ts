import { Component } from '@angular/core';
import { HeroCarouselComponent } from './hero-carousel/hero-carousel.component';
import { AuctionsSectionComponent } from './auctions-section/auctions-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroCarouselComponent, AuctionsSectionComponent],
  template: `
    <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <app-hero-carousel />
      <app-auctions-section />
    </div>
  `,
})
export class HomeComponent {}
