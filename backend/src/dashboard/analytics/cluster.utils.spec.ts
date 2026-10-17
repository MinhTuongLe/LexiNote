import { describe, expect, it } from '@jest/globals';
import { buildWordClusters } from './cluster.utils';

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
});
