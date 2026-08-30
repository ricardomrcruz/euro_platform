import { Ad } from '../entities/ad.entity';

const AD_REF_WIDTH = 7;
const SEQUENCE_WIDTH = 2;
const DEFAULT_EXTENSION = 'jpg';

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

// UTC so the folder name is deterministic regardless of server/client timezone.
function formatTimestamp(date: Date): string {
  const y = date.getUTCFullYear();
  const mo = pad(date.getUTCMonth() + 1, 2);
  const d = pad(date.getUTCDate(), 2);
  const h = pad(date.getUTCHours(), 2);
  const mi = pad(date.getUTCMinutes(), 2);
  const s = pad(date.getUTCSeconds(), 2);
  return `${y}${mo}${d}_${h}${mi}${s}`;
}

function extensionOf(filename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  return (match?.[1] ?? DEFAULT_EXTENSION).toLowerCase();
}

// One stable folder per ad -- keyed off the ad's own id + creation time, not its title, so
// it stays the same across every upload batch (create, then later adding more photos on edit).
export function buildAdPhotoFolder(ad: Ad): string {
  return `${pad(ad.id, AD_REF_WIDTH)}_${formatTimestamp(ad.createdAt)}`;
}

// e.g. ads/0000042_20260830_143210/0000042_20260830_143210_01.jpg
export function buildPhotoObjectKey(ad: Ad, sequence: number, originalFilename: string): string {
  const folder = buildAdPhotoFolder(ad);
  return `ads/${folder}/${folder}_${pad(sequence, SEQUENCE_WIDTH)}.${extensionOf(originalFilename)}`;
}
