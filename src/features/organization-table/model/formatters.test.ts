import { describe, expect, it } from 'vitest';
import { formatAveragePerformance, formatBudget } from './formatters';

describe('organization table formatters', () => {
  it('formats grouped budgets with the ruble suffix', () => {
    expect(formatBudget(12345678)).toBe('12 345 678 руб.');
  });

  it('uses an em dash for zero-headcount averages', () => {
    expect(formatAveragePerformance(null)).toBe('—');
  });
});
