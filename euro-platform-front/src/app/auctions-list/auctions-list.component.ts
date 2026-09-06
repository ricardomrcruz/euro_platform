import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuctionCardComponent } from '../shared/auction-card/auction-card.component';
import { AuctionService, toAuctionCardData } from '../auction/auction.service';
import { AuctionCardData } from '../home/auction-view-models';

@Component({
  selector: 'app-auctions-list',
  standalone: true,
  imports: [AuctionCardComponent, TranslatePipe],
  templateUrl: './auctions-list.component.html',
})
export class AuctionsListComponent implements OnInit {
  private readonly auctionService = inject(AuctionService);

  readonly auctions = signal<AuctionCardData[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.auctionService.listHistory().then((auctions) => {
      this.auctions.set(auctions.map(toAuctionCardData));
      this.loading.set(false);
    });
  }
}
