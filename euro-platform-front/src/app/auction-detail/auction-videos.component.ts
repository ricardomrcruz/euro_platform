import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import type { VideoItem } from './interfaces/auction-detail.interface';

@Component({
  selector: 'app-auction-videos',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './auction-videos.component.html',
})
export class AuctionVideosComponent {
  videos = input.required<VideoItem[]>();
}
