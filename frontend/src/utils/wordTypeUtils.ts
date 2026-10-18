export const CANONICAL_WORD_TYPES = [
  'noun',
  'verb',
  'adj',
  'adv',
  'phrasal_verb',
  'idiom',
  'phrase',
  'noun_phrase',
  'verb_phrase',
  'other',
] as const;

const WORD_TYPE_ALIASES: Record<string, string> = {
  adjective: 'adj',
  adverb: 'adv',
  'verb phrase': 'verb_phrase',
  'noun phrase': 'noun_phrase',
  'phrasal verb': 'phrasal_verb',
};

export function normalizeWordType(value: string | undefined | null): string {
  const normalized = (value ?? '').trim().toLowerCase().replace(/-/g, '_');
  const canonical = WORD_TYPE_ALIASES[normalized] ?? normalized;
  return CANONICAL_WORD_TYPES.includes(canonical as (typeof CANONICAL_WORD_TYPES)[number])
    ? canonical
    : 'other';
}
