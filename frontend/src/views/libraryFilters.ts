export type LibraryStatus = 'all' | 'new' | 'learning' | 'mastered';

const LIBRARY_STATUSES: ReadonlySet<string> = new Set(['new', 'learning', 'mastered']);

export const getInitialLibraryStatus = (searchParams: URLSearchParams): LibraryStatus => {
  const filter = searchParams.get('filter');
  return filter && LIBRARY_STATUSES.has(filter) ? (filter as LibraryStatus) : 'all';
};
