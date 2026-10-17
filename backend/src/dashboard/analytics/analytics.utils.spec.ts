import { describe, expect, it } from '@jest/globals';
import { formatPercentageChange } from './analytics.utils';

describe('formatPercentageChange', () => {
  it('returns a signed percentage change', () => {
    expect(formatPercentageChange(120, 100)).toBe('+20.0%');
    expect(formatPercentageChange(80, 100)).toBe('-20.0%');
  });

  it('handles an empty previous period', () => {
    expect(formatPercentageChange(0, 0)).toBe('+0.0%');
    expect(formatPercentageChange(4, 0)).toBe('+100.0%');
  });
});
