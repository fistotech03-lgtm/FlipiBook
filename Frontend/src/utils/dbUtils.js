// IndexedDB Helpers for Editor State Persistence
const DB_NAME = 'Flipibook';
const STORE_NAME = 'EditorState';

export const PAGE_EDITOR_KEY = 'page_editor';
export const CUSTOMIZED_EDITOR_KEY = 'customized_editor';

/**
 * Initializes the IndexedDB instance
 * @returns {Promise<IDBDatabase>}
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || 'Failed to open IndexedDB');
  });
};

/**
 * Saves a value to IndexedDB
 * @param {string} key 
 * @param {any} value 
 * @returns {Promise<void>}
 */
export const saveToDB = async (key, value) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("IndexedDB Save Error:", err);
  }
};

/**
 * Retrieves a value from IndexedDB
 * @param {string} key 
 * @returns {Promise<any>}
 */
export const getFromDB = async (key) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("IndexedDB Load Error:", err);
    return null;
  }
};

/**
 * Deletes a value from IndexedDB by key
 * @param {string} key 
 * @returns {Promise<void>}
 */
export const deleteFromDB = async (key) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("IndexedDB Delete Error:", err);
  }
};

/**
 * Completely clears all entries from the EditorState store
 */
export const clearEditorState = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("[dbUtils] Clear Editor State Error:", err);
  }
};

export const getCustomizedEditorKey = (v_id) => v_id ? `customized_editor_${v_id}` : CUSTOMIZED_EDITOR_KEY;
export const getPageEditorKey = (v_id) => v_id ? `page_editor_${v_id}` : PAGE_EDITOR_KEY;

/**
 * Cleans the active pointer if the currently stored book is different
 * from the newly opened book's v_id, while safely preserving book-specific state.
 * @param {string} activeVId
 */
export const ensureCleanBook = async (activeVId) => {
  if (!activeVId) return;
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const custReq = store.get(CUSTOMIZED_EDITOR_KEY);
      custReq.onsuccess = () => {
        const val = custReq.result;
        // If the legacy single-key pointer belongs to a different book, clear just the pointer
        // while book-specific keys (customized_editor_${val.v_id}) remain intact
        if (val && val.v_id && val.v_id !== activeVId) {
          store.delete(CUSTOMIZED_EDITOR_KEY);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('[dbUtils] ensureCleanBook warning:', e);
  }
};

/**
 * Sanitizes page objects before saving to IndexedDB to guarantee
 * they are cloneable and free of DOM/function references.
 */
const sanitizePages = (pages) => {
  if (!Array.isArray(pages)) return [];
  return pages.map((p, idx) => ({
    id: p.id !== undefined ? p.id : idx,
    v_id: p.v_id !== undefined ? p.v_id : idx,
    name: p.name || `Page ${idx + 1}`,
    fileName: p.fileName || `${idx + 1}.svg`,
    pageNumber: p.pageNumber || (idx + 1),
    isHidden: Boolean(p.isHidden || p.hide === 1 || String(p.hide) === '1'),
    html: typeof p.html === 'string' ? p.html : (typeof p.content === 'string' ? p.content : ''),
    content: typeof p.content === 'string' ? p.content : (typeof p.html === 'string' ? p.html : '')
  }));
};

/**
 * Deep clones an object safely without crashing on circular refs,
 * React elements, File/Blob instances, or non-serializable properties.
 */
const safeClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  const seen = new WeakSet();

  const clone = (item) => {
    if (item === null || typeof item !== 'object') return item;
    if (typeof item === 'function' || typeof item === 'symbol') return undefined;
    if (item instanceof Element || item instanceof Node) return undefined;
    if (item instanceof File || item instanceof Blob) return null;
    if (seen.has(item)) return undefined;
    seen.add(item);

    if (Array.isArray(item)) {
      return item.map(clone).filter((v) => v !== undefined);
    }
    const copy = {};
    for (const key of Object.keys(item)) {
      if (key.startsWith('$$') || key.startsWith('_react')) continue;
      const val = clone(item[key]);
      if (val !== undefined) {
        copy[key] = val;
      }
    }
    return copy;
  };

  try {
    return clone(obj);
  } catch (e) {
    console.warn('[dbUtils] safeClone error:', e);
    return {};
  }
};

/**
 * Clears old legacy temporary editor keys from IndexedDB.
 * Preserves book-specific states (e.g. customized_editor_<v_id>).
 */
export const cleanupLegacyEditorKeys = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAllKeys();
      req.onsuccess = () => {
        const keys = req.result || [];
        keys.forEach((k) => {
          if (typeof k === 'string') {
            const isKnown = k === PAGE_EDITOR_KEY || 
              k === CUSTOMIZED_EDITOR_KEY || 
              k.startsWith('customized_editor_') || 
              k.startsWith('page_editor_');
            if (!isKnown) {
              store.delete(k);
            }
          }
        });
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("[dbUtils] IndexedDB Cleanup Error:", err);
  }
};

/**
 * Saves the latest Page Editor state for the active book.
 */
export const savePageEditorState = async (data) => {
  try {
    if (!data || !data.v_id) return;
    const sanitizedPages = sanitizePages(data?.pages);
    const rawPayload = {
      v_id: data.v_id,
      pageName: data.pageName || data.bookName || 'Untitled Flipbook',
      bookName: data.pageName || data.bookName || 'Untitled Flipbook',
      activePageIndex: data.activePageIndex || 0,
      pages: sanitizedPages,
      timestamp: data.timestamp || Date.now()
    };
    const payload = safeClone(rawPayload);
    const bookKey = getPageEditorKey(data.v_id);
    await saveToDB(bookKey, payload);
    await saveToDB(PAGE_EDITOR_KEY, payload);
  } catch (err) {
    console.error("[dbUtils] Save Page Editor Error:", err);
  }
};

/**
 * Retrieves the latest Page Editor state for a given book or the active fallback
 */
export const getPageEditorState = async (v_id) => {
  if (v_id) {
    const bookData = await getFromDB(getPageEditorKey(v_id));
    if (bookData && bookData.v_id === v_id) return bookData;
  }
  const data = await getFromDB(PAGE_EDITOR_KEY);
  if (data && (!v_id || data.v_id === v_id)) return data;
  return await getFromDB('editor_autosave');
};

/**
 * Saves the latest Customized Editor state for instant quick-load caching.
 * Saves both to the book-specific key and the active book pointer.
 */
export const saveCustomizedEditorState = async (data) => {
  try {
    if (!data || !data.v_id) return;
    const sanitizedPages = sanitizePages(data?.pages);
    const rawPayload = {
      v_id: data.v_id,
      bookName: data.bookName || 'Untitled Flipbook',
      folderName: data.folderName || 'My_Flipbooks',
      targetPage: data.targetPage || data.activePageIndex || 0,
      activePageIndex: data.targetPage || data.activePageIndex || 0,
      pages: sanitizedPages,
      Background: data.Background || {},
      BookAppearance: data.BookAppearance || {},
      Layouts: data.Layouts || {},
      MenuBar: data.MenuBar || {},
      Branding: data.Branding || {},
      Visibility: data.Visibility || {},
      shareSettings: data.shareSettings || {},
      otherSetup: data.otherSetup || {},
      leadForm: data.leadForm || {},
      bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : [],
      notes: Array.isArray(data.notes) ? data.notes : [],
      timestamp: data.timestamp || Date.now()
    };
    const payload = safeClone(rawPayload);
    const bookKey = getCustomizedEditorKey(data.v_id);

    await saveToDB(bookKey, payload);
    await saveToDB(CUSTOMIZED_EDITOR_KEY, payload);

    // Keep page_editor synchronized for this book
    if (payload.v_id && sanitizedPages.length > 0) {
      const pagePayload = {
        v_id: payload.v_id,
        pageName: payload.bookName,
        bookName: payload.bookName,
        activePageIndex: payload.targetPage || 0,
        pages: sanitizedPages,
        timestamp: payload.timestamp
      };
      await saveToDB(getPageEditorKey(payload.v_id), pagePayload);
      await saveToDB(PAGE_EDITOR_KEY, pagePayload);
    }
  } catch (err) {
    console.error("[dbUtils] Save Customized Editor Error:", err);
  }
};

/**
 * Retrieves the latest Customized Editor state for a given book or the active fallback
 */
export const getCustomizedEditorState = async (v_id) => {
  if (v_id) {
    const bookData = await getFromDB(getCustomizedEditorKey(v_id));
    if (bookData && bookData.v_id === v_id) return bookData;
  }
  const data = await getFromDB(CUSTOMIZED_EDITOR_KEY);
  if (data && (!v_id || data.v_id === v_id)) return data;
  return null;
};
