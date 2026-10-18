import { describe, expect, it } from '@jest/globals';
import { buildWordClusters, normalizeWordType } from './cluster.utils';

describe('buildWordClusters', () => {
  it('groups words by lexical type and sorts largest clusters first', () => {
    expect(
      buildWordClusters([
        { type: 'verb' },
        { type: 'noun' },
        { type: 'verb' },
        { type: null },
      ]),
    ).toEqual([
      { name: 'verb', count: 2 },
      { name: 'noun', count: 1 },
      { name: 'other', count: 1 },
    ]);
  });

  it('normalizes alias types like adj and adjective into canonical adjective cluster', () => {
    expect(
      buildWordClusters([
        { type: 'adj' },
        { type: 'adjective' },
        { type: 'ADJ' },
      ]),
    ).toEqual([{ name: 'adjective', count: 3 }]);
  });
});

describe('normalizeWordType', () => {
  it('correctly maps abbreviation aliases to canonical word types', () => {
    expect(normalizeWordType('adj')).toBe('adjective');
    expect(normalizeWordType('adv')).toBe('adverb');
    expect(normalizeWordType('n')).toBe('noun');
    expect(normalizeWordType('v')).toBe('verb');
    expect(normalizeWordType(null)).toBe('other');
  });
});
