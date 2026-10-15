import { QueryClient } from '@tanstack/react-query';
import flipbookApi from './api/flipbookApi';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
      gcTime: 1000 * 60 * 10,   // 10 minutes cache retention
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const fetchFlipbookFolders = async (emailId) => {
  if (!emailId) return [];
  const folderRes = await flipbookApi.getFolders(emailId);
  let fetchedFolders = (folderRes.data?.folders || []).filter((f) => {
    const name = typeof f === 'string' ? f : f?.name;
    const lower = String(name || '').toLowerCase().trim();
    return (
      lower !== 'public book' &&
      lower !== 'recent book' &&
      lower !== 'recent' &&
      lower !== 'all flipbook' &&
      lower !== 'all flipbooks' &&
      lower !== 'favorites' &&
      lower !== 'trash'
    );
  }).map((f) => {
    if (typeof f === 'string') return { id: f, name: f };
    return { id: f.id || f.name, name: f.name };
  });

  const hasDefaultFolder = fetchedFolders.some(
    (f) => f.name.toLowerCase() === 'my_flipbooks'
  );
  if (!hasDefaultFolder) {
    fetchedFolders.unshift({ id: 'default_my_flipbooks', name: 'My_Flipbooks' });
  }
  return fetchedFolders;
};

export const fetchFlipbookBooks = async (emailId) => {
  if (!emailId) return [];
  const booksRes = await flipbookApi.getBooks(emailId);
  const rawBooks = booksRes.data?.books || [];
  return rawBooks.map((b) => {
    const f = b.folder || b.folderName;
    const pageCount = Array.isArray(b.pages)
      ? b.pages.length
      : (typeof b.pages === 'number' ? b.pages : (parseInt(b.pagesCount, 10) || 1));
    return {
      ...b,
      folder: (!f || f === 'All Flipbook' || f === 'All Flipbooks') ? 'My_Flipbooks' : f,
      pages: pageCount,
      pagesCount: pageCount,
      pagesList: Array.isArray(b.pages) ? b.pages : (b.pagesList || []),
    };
  });
};

/**
 * Prefetch MyFlipbooks data right after login success or auth check.
 * This loads folders, books, and storage into memory cache before the user lands on the page.
 */
export const prefetchMyFlipbooks = (emailId) => {
  if (!emailId || emailId === 'No Email' || emailId === 'guest@example.com') return;

  queryClient.prefetchQuery({
    queryKey: ['flipbook-folders', emailId],
    queryFn: () => fetchFlipbookFolders(emailId),
    staleTime: 1000 * 60 * 3,
  });

  queryClient.prefetchQuery({
    queryKey: ['flipbook-books', emailId],
    queryFn: () => fetchFlipbookBooks(emailId),
    staleTime: 1000 * 60 * 3,
  });

  queryClient.prefetchQuery({
    queryKey: ['user-storage', emailId],
    queryFn: async () => {
      const res = await flipbookApi.getStorageSettings(emailId);
      return {
        used: typeof res.data?.usedStorage === 'number' ? res.data.usedStorage : 0,
        total: typeof res.data?.maxStorage === 'number' ? res.data.maxStorage : 300 * 1024 * 1024,
      };
    },
    staleTime: 1000 * 60 * 3,
  });
};
