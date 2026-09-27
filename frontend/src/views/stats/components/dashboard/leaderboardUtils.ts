import type { LeaderboardEntry } from '../../../../types';

export type PodiumPlace = 'first' | 'second' | 'third';

export interface PodiumEntry extends LeaderboardEntry {
  place: PodiumPlace;
}

const PODIUM_ORDER: Array<{ rank: number; place: PodiumPlace }> = [
  { rank: 2, place: 'second' },
  { rank: 1, place: 'first' },
  { rank: 3, place: 'third' },
];

export function getPodiumEntries(entries: LeaderboardEntry[]): PodiumEntry[] {
  return PODIUM_ORDER.flatMap(({ rank, place }) => {
    const entry = entries.find((candidate) => candidate.rank === rank);
    return entry ? [{ ...entry, place }] : [];
  });
}

export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}
