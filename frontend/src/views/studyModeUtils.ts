const stableHash = (value: string, seed: number): number => {
  let hash = seed | 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return hash;
};

export const createQuizChoices = (
  correct: string,
  otherMeanings: string[],
  fallbackFillers: string[],
  seed: number,
): string[] => {
  const pool = Array.from(new Set([...otherMeanings, ...fallbackFillers]))
    .filter((meaning) => meaning && meaning !== correct)
    .sort((left, right) => stableHash(left, seed) - stableHash(right, seed));

  return [correct, ...pool.slice(0, 3)].sort(
    (left, right) => stableHash(left, seed + 1) - stableHash(right, seed + 1),
  );
};
