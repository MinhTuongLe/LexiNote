import { describe, expect, it } from 'vitest';
import { getInitialLibraryStatus } from './libraryFilters';

describe('getInitialLibraryStatus', () => {
  it.each(['new', 'learning', 'mastered'])('reads the %s deep-link filter', (filter) => {
    expect(getInitialLibraryStatus(new URLSearchParams(`filter=${filter}`))).toBe(filter);
  });

  it('falls back to all for missing or invalid values', () => {
    expect(getInitialLibraryStatus(new URLSearchParams())).toBe('all');
    expect(getInitialLibraryStatus(new URLSearchParams('filter=unknown'))).toBe('all');
  });
});
