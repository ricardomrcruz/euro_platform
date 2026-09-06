import { placeholder } from './photo-placeholder.util';

export interface PhotoLike {
  url: string;
  isPrimary: boolean;
}

// Shared by every page that lists an ad/auction and needs a representative thumbnail --
// homepage cards, auction-detail, and any admin/seller list that only has the raw
// Ad/AdPhoto shape (not a full gallery).
export function primaryPhotoUrl(photos: PhotoLike[], fallbackLabel: string): string {
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  return primary?.url ?? placeholder(fallbackLabel);
}
