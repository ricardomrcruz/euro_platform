import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import type { DetailSection } from './interfaces/auction-detail.interface';

@Component({
  selector: 'app-auction-detail-sections',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './auction-detail-sections.component.html',
})
export class AuctionDetailSectionsComponent {
  sections = input.required<DetailSection[]>();
}
