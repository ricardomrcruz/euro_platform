import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';
import { CountdownComponent } from '../countdown/countdown.component';
import type { AuctionCardData } from '../../home/mock-data';

@Component({
  selector: 'app-auction-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TagModule, CountdownComponent, TranslatePipe],
  templateUrl: './auction-card.component.html',
})
export class AuctionCardComponent {
  data = input.required<AuctionCardData>();
}
