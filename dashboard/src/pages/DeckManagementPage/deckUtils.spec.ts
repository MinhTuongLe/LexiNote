import { describe, expect, it } from 'vitest';
import { parseDeckWords } from './deckUtils';

describe('parseDeckWords', () => {
  it('parses pipe-separated deck rows and ignores malformed rows', () => {
    expect(parseDeckWords('hello | xin chào | noun\ninvalid\nrun | chạy | verb')).toEqual([
      { word: 'hello', meaningVi: 'xin chào', type: 'noun' },
      { word: 'run', meaningVi: 'chạy', type: 'verb' },
    ]);
  });
});
