import { describe, expect, it } from 'vitest';
import { createQuizChoices } from './studyModeUtils';

describe('createQuizChoices', () => {
  it('keeps the correct answer and returns four unique choices', () => {
    const choices = createQuizChoices('đúng', ['sai 1', 'sai 2'], ['fallback'], 7);

    expect(choices).toHaveLength(4);
    expect(choices).toContain('đúng');
    expect(new Set(choices).size).toBe(4);
  });

  it('is deterministic for the same seed', () => {
    const first = createQuizChoices('đúng', ['sai 1', 'sai 2', 'sai 3'], [], 42);
    const second = createQuizChoices('đúng', ['sai 1', 'sai 2', 'sai 3'], [], 42);

    expect(first).toEqual(second);
  });
});
