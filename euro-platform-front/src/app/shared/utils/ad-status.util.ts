import { AdStatus } from '../../ad/interfaces/ad.interface';

// p-tag severity per ad status -- matches the color language already used for reserve/
// no-reserve tags elsewhere (auction-card, auction-bid-panel).
export const STATUS_SEVERITY: Record<AdStatus, 'secondary' | 'warn' | 'success' | 'danger'> = {
  DRAFT: 'secondary',
  REVIEW: 'warn',
  VALIDATED: 'success',
  REJECTED: 'danger',
};
