import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAiFilterResponse } from './ai-filter/ai-filter.mjs';

test('accepts a supported structured filter', () => {
  assert.deepEqual(parseAiFilterResponse({
    nameContains: 'север',
    levels: ['Отдел', 'Команда'],
    minPerformance: 70,
    maxPerformance: 95,
  }), {
    nameContains: 'север',
    levels: ['Отдел', 'Команда'],
    minPerformance: 70,
    maxPerformance: 95,
  });
});

test('accepts budget ordering with a result limit', () => {
  assert.deepEqual(parseAiFilterResponse({
    levels: ['Отдел'],
    sortBy: 'totalBudget',
    sortDirection: 'asc',
    limit: 1,
  }), {
    levels: ['Отдел'],
    sortBy: 'totalBudget',
    sortDirection: 'asc',
    limit: 1,
  });
});

test('accepts budget and employee ranges with metric sorting', () => {
  assert.deepEqual(parseAiFilterResponse({
    minBudget: 1000000,
    maxBudget: 2000000,
    minEmployees: 50,
    maxEmployees: 100,
    sortBy: 'averagePerformance',
    sortDirection: 'desc',
    limit: 5,
  }), {
    minBudget: 1000000,
    maxBudget: 2000000,
    minEmployees: 50,
    maxEmployees: 100,
    sortBy: 'averagePerformance',
    sortDirection: 'desc',
    limit: 5,
  });
});

test('rejects unsupported fields and malformed values', () => {
  assert.throws(
    () => parseAiFilterResponse({ nameContains: 'север', unsupported: true }),
    { name: 'AiFilterValidationError' },
  );
  assert.throws(
    () => parseAiFilterResponse({ levels: ['Сотрудник'] }),
    { name: 'AiFilterValidationError' },
  );
  assert.throws(
    () => parseAiFilterResponse({ minPerformance: 90, maxPerformance: 40 }),
    { name: 'AiFilterValidationError' },
  );
});

test('rejects non-object provider output', () => {
  assert.throws(
    () => parseAiFilterResponse({ filter: { nameContains: 'север' } }),
    { name: 'AiFilterValidationError' },
  );
});
