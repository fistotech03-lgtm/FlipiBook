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
  const rawFolders = folderRes.data?.folders || [];

  let hasDefault = false;
  const cleanedFolders = [];
  const seenNames = new Set();

  rawFolders.forEach((f) => {
    const rawName = typeof f === 'string' ? f : f?.name;
    if (!rawName) return;
    const lower = String(rawName).trim().toLowerCase();
    if (
      lower === 'public book' ||
      lower === 'recent book' ||
      lower === 'recent' ||
      lower === 'all flipbook' ||
      lower === 'all flipbooks' ||
      lower === 'favorites' ||
      lower === 'trash'
    ) {
      return;
    }

    const isDefault = Boolean(typeof f === 'object' && f.isDefault) || (!hasDefault && (lower === 'default' || lower === 'my flipbooks'));

    if (isDefault) {
      if (!hasDefault) {
        hasDefault = true;
        const displayName = (lower === 'default') ? 'My Flipbooks' : String(rawName).trim();
        cleanedFolders.unshift({
          id: (typeof f === 'object' && (f.id || f._id)) ? String(f.id || f._id) : 'default_folder',
          name: displayName,
          isDefault: true
        });
        seenNames.add(displayName.toLowerCase());
      }
      return;
    }

    if (!seenNames.has(lower)) {
      seenNames.add(lower);
      cleanedFolders.push({
        id: (typeof f === 'object' && (f.id || f._id)) ? String(f.id || f._id) : rawName,
        name: String(rawName).trim(),
        isDefault: false
      });
    }
  });

  if (!hasDefault) {
    cleanedFolders.unshift({ id: 'default_folder', name: 'My Flipbooks', isDefault: true });
  }

  return cleanedFolders;
};

export const fetchFlipbookBooks = async (emailId) => {
  if (!emailId) return [];
  const booksRes = await flipbookApi.getBooks(emailId);
  const rawBooks = booksRes.data?.books || [];
  return rawBooks.map((b) => {
    let f = b.folder || b.folderName;
    if (Array.isArray(f)) f = f[0];
    const lower = String(f || '').trim().toLowerCase();
    const resolvedFolder = (!lower || lower === 'default' || lower === 'my flipbooks' || lower === 'all flipbook' || lower === 'all flipbooks')
      ? 'My Flipbooks'
      : f;

    const pageCount = Array.isArray(b.pages)
      ? b.pages.length
      : (typeof b.pages === 'number' ? b.pages : (parseInt(b.pagesCount, 10) || 1));
    return {
      ...b,
      folder: resolvedFolder,
      folderName: resolvedFolder,
      folder_v_id: b.folder_v_id || b.folder_id || 'fol_default',
      folder_id: b.folder_v_id || b.folder_id || 'fol_default',
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
    staleTime: 0,
  });

  queryClient.prefetchQuery({
    queryKey: ['flipbook-books', emailId],
    queryFn: () => fetchFlipbookBooks(emailId),
    staleTime: 0,
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
