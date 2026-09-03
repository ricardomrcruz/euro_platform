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
  // Any number of thumbnails (excludes the main photo) -- the grid auto-sizes its row count,
  // and a final "see all" tile (built from the last thumbnail with a blur overlay, not part
  // of this list) always lands right after them.
  thumbnailUrls = input.required<string[]>();
  totalPhotoCount = input.required<number>();

  // Slideshow isn't built yet -- this is a placeholder for that click, per plan.
  openGallery(): void {}
}
