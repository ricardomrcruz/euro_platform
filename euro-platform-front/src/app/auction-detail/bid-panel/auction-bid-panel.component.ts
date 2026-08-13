import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';
import { CountdownComponent } from '../../shared/countdown/countdown.component';
import type { AuctionDetailData } from '../mock-detail-data';

@Component({
  selector: 'app-auction-bid-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, TranslatePipe, CountdownComponent],
  templateUrl: './auction-bid-panel.component.html',
})
export class AuctionBidPanelComponent {
  detail = input.required<AuctionDetailData>();
}
