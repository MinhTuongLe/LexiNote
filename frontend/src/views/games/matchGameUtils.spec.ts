import { describe, expect, it } from 'vitest';
import { createMatchGameSessionPayload } from './matchGameUtils';

describe('createMatchGameSessionPayload', () => {
  it('uses the completed word count for score and elapsed time for duration', () => {
    expect(createMatchGameSessionPayload([1, 2, 3], 1_000, 6_500)).toEqual({
      gameType: 'MATCH_GAME',
      score: 60,
      timeSpentSeconds: 6,
      wordIds: [1, 2, 3],
    });
  });

  it('keeps duration at one second when completion happens immediately', () => {
    expect(createMatchGameSessionPayload([42], 10_000, 10_000).timeSpentSeconds).toBe(1);
  });
});
