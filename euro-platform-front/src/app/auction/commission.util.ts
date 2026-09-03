// Mirrors euro-platform-api/src/auction/commission.service.ts exactly -- keep both in sync.
// Matches Cars & Bids' real buyer's-premium formula: seller keeps 100% of the price, the
// buyer separately pays this on top (5%, floor 250, cap 7500).
export const COMMISSION_RATE = 0.05;
export const MIN_COMMISSION = 250;
export const MAX_COMMISSION = 7500;

export function calculateCommission(price: number): number {
  return Math.min(Math.max(price * COMMISSION_RATE, MIN_COMMISSION), MAX_COMMISSION);
}
