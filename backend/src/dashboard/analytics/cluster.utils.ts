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

export const buildWordClusters = (
  words: ClusterSourceWord[],
): WordCluster[] => {
  const counts = new Map<string, number>();
  words.forEach(({ type }) => {
    const name = type?.trim() || 'other';
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
    const name = type?.trim() || 'other';
    counts.set(name, (counts.get(name) || 0) + count);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.name.localeCompare(right.name),
    );
};
