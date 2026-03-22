export const WORD_TYPES = [
  { value: 'noun', labelKey: 'noun', defaultLabel: 'Noun' },
  { value: 'verb', labelKey: 'verb', defaultLabel: 'Verb' },
  { value: 'adj', labelKey: 'adj', defaultLabel: 'Adjective' },
  { value: 'adv', labelKey: 'adv', defaultLabel: 'Adverb' },
  { value: 'phrasal_verb', labelKey: 'phrasal_verb', defaultLabel: 'Phrasal Verb' },
  { value: 'idiom', labelKey: 'idiom', defaultLabel: 'Idiom' },
  { value: 'phrase', labelKey: 'phrase', defaultLabel: 'Phrase' },
  { value: 'noun_phrase', labelKey: 'noun_phrase', defaultLabel: 'Noun Phrase' },
  { value: 'verb_phrase', labelKey: 'verb_phrase', defaultLabel: 'Verb Phrase' },
  { value: 'other', labelKey: 'other', defaultLabel: 'Other' }
];

export type WordType = 'noun' | 'verb' | 'adj' | 'adv' | 'phrasal_verb' | 'idiom' | 'phrase' | 'noun_phrase' | 'verb_phrase' | 'other';
