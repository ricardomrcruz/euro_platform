import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-auction-gallery',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './auction-gallery.component.html',
})
export class AuctionGalleryComponent {
  title = input.required<string>();
  mainPhotoUrl = input.required<string>();
  // Always exactly 7 (padded/cycled by toAuctionDetailData when an ad has fewer real photos
  // than that), excluding the main photo, matching the 2-column x 4-row grid -- the 8th tile
  // is built from the last one with a blur overlay, so it isn't part of this list.
  thumbnailUrls = input.required<string[]>();
  totalPhotoCount = input.required<number>();

  // Slideshow isn't built yet -- this is a placeholder for that click, per plan.
  openGallery(): void {}
}
