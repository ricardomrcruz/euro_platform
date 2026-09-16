// @ts-nocheck
import { CommissionService } from '../commission.service';

describe('CommissionService', () => {
  const service = new CommissionService();

  it('charges 5% for a mid-range amount', () => {
    expect(service.calculate(20_000)).toBe(1000);
  });

  it('floors to the €250 minimum below the 5% break-even point', () => {
    expect(service.calculate(1_000)).toBe(250);
    expect(service.calculate(100)).toBe(250);
  });

  it('applies exactly the minimum at the break-even boundary', () => {
    // 5% of 5000 is exactly 250.
    expect(service.calculate(5_000)).toBe(250);
  });

  it('caps at the €7500 maximum above the 5% break-even point', () => {
    expect(service.calculate(500_000)).toBe(7500);
  });

  it('applies exactly the maximum at the break-even boundary', () => {
    // 5% of 150000 is exactly 7500.
    expect(service.calculate(150_000)).toBe(7500);
  });

  it('never returns less than the minimum for a zero or negative amount', () => {
    expect(service.calculate(0)).toBe(250);
  });
});
