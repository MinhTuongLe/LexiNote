import type { GameType } from '../../types';

interface MatchGameSessionPayload {
  gameType: GameType;
  score: number;
  timeSpentSeconds: number;
  wordIds: number[];
}

export const createMatchGameSessionPayload = (
  wordIds: number[],
  startedAtMs: number,
  completedAtMs: number,
): MatchGameSessionPayload => ({
  gameType: 'MATCH_GAME',
  score: wordIds.length * 20,
  timeSpentSeconds: Math.max(1, Math.round((completedAtMs - startedAtMs) / 1000)),
  wordIds,
});
