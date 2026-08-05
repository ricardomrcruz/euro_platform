import { Injectable } from '@nestjs/common';

const RATE = 0.05;
const MIN_COMMISSION = 250;
const MAX_COMMISSION = 7500;

// One fixed rate for now; Strategy pattern only worth it if rates diversify.
@Injectable()
export class CommissionService {
  calculate(amount: number): number {
    return Math.min(Math.max(amount * RATE, MIN_COMMISSION), MAX_COMMISSION);
  }
}
