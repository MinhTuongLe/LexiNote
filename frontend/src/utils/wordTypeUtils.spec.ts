import { describe, expect, it } from 'vitest';
import { normalizeWordType } from './wordTypeUtils';

describe('normalizeWordType', () => {
  it('maps common AI/import aliases to canonical word types', () => {
    expect(normalizeWordType('adjective')).toBe('adj');
    expect(normalizeWordType('adverb')).toBe('adv');
    expect(normalizeWordType('verb phrase')).toBe('verb_phrase');
    expect(normalizeWordType('unknown')).toBe('other');
  });
});
