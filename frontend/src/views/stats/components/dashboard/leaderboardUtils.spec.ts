import { describe, expect, it } from 'vitest';
import type { LeaderboardEntry } from '../../../../types';
import { getInitials, getPodiumEntries } from './leaderboardUtils';

const entry = (rank: number): LeaderboardEntry => ({
  rank,
  user: { id: rank, fullName: `Player ${rank}`, avatar: null },
  bestScore: rank * 10,
  bestTimeSeconds: rank,
});

describe('leaderboard utilities', () => {
  it('orders the podium as second, first, third while preserving available ranks', () => {
    expect(getPodiumEntries([entry(1), entry(2), entry(3)])).toEqual([
      { ...entry(2), place: 'second' },
      { ...entry(1), place: 'first' },
      { ...entry(3), place: 'third' },
    ]);
  });

  it('does not invent missing podium positions', () => {
    expect(getPodiumEntries([entry(1), entry(3)])).toEqual([
      { ...entry(1), place: 'first' },
      { ...entry(3), place: 'third' },
    ]);
  });

  it('returns a readable fallback for missing names', () => {
    expect(getInitials('')).toBe('U');
    expect(getInitials('minh thao')).toBe('MI');
  });
});
