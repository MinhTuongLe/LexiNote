export interface ClusterSourceWord {
  type: string | null;
}

export interface WordCluster {
  name: string;
  count: number;
}

export interface WordClusterCount {
  type: string | null;
  count: number;
}

export const normalizeWordType = (
  rawType: string | null | undefined,
): string => {
  const t = rawType?.trim().toLowerCase();
  if (!t) return 'other';
  if (t === 'adj' || t === 'adjective') return 'adjective';
  if (t === 'adv' || t === 'adverb') return 'adverb';
  if (t === 'n' || t === 'noun') return 'noun';
  if (t === 'v' || t === 'verb') return 'verb';
  if (t === 'phrase' || t === 'phr') return 'phrase';
  if (t === 'idiom') return 'idiom';
  if (t === 'noun_phrase' || t === 'noun phrase') return 'noun_phrase';
  if (t === 'phrasal_verb' || t === 'phrasal verb') return 'phrasal_verb';
  return t;
};

export const buildWordClusters = (
  words: ClusterSourceWord[],
): WordCluster[] => {
  const counts = new Map<string, number>();
  words.forEach(({ type }) => {
    const name = normalizeWordType(type);
    counts.set(name, (counts.get(name) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.name.localeCompare(right.name),
    );
};

export const buildWordClustersFromCounts = (
  groups: WordClusterCount[],
): WordCluster[] => {
  const counts = new Map<string, number>();
  groups.forEach(({ type, count }) => {
    const name = normalizeWordType(type);
    counts.set(name, (counts.get(name) || 0) + count);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.name.localeCompare(right.name),
    );
};
