import { Component, HostListener, input, signal } from '@angular/core';
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
  // The real, deduplicated photo set (cover photo first) -- what the fullscreen slideshow
  // actually browses, as opposed to the grid's padded/cycled thumbnailUrls.
  photoUrls = input.required<string[]>();

  readonly lightboxIndex = signal<number | null>(null);

  // Opens on whichever real photo this grid tile's URL corresponds to -- falls back to the
  // first photo if the URL somehow isn't found (shouldn't happen, photoUrls always contains
  // every URL the grid can show).
  openAt(url: string): void {
    const index = this.photoUrls().indexOf(url);
    this.lightboxIndex.set(index === -1 ? 0 : index);
  }

  openAll(): void {
    this.lightboxIndex.set(0);
  }

  closeLightbox(): void {
    this.lightboxIndex.set(null);
  }

  next(): void {
    const count = this.photoUrls().length;
    this.lightboxIndex.update((i) => (i === null ? null : (i + 1) % count));
  }

  prev(): void {
    const count = this.photoUrls().length;
    this.lightboxIndex.update((i) => (i === null ? null : (i - 1 + count) % count));
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.lightboxIndex() === null) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }
}
