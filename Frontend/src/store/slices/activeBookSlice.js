import { createSlice } from '@reduxjs/toolkit';

const getInitialAutoSave = () => {
  try {
    const stored = localStorage.getItem('isAutoSaveEnabled');
    return stored !== null ? JSON.parse(stored) : true;
  } catch {
    return true;
  }
};

const initialState = {
  currentBook: null,
  bookName: 'Untitled Flipbook',
  v_id: null,
  folder: 'My_Flipbooks',
  hasUnsavedChanges: false,
  isSaving: false,
  isAutoSaveEnabled: getInitialAutoSave(),
  activeDevice: 'Desktop', // 'Desktop' | 'Tablet' | 'Mobile'

  // Action Triggers: Navbar clicks trigger actions that active editor reacts to
  saveTriggerCount: 0,
  exportTriggerCount: 0,
  clearTriggerCount: 0,
  previewTriggerCount: 0,

  // Export context passed to ExportModal
  exportContext: {
    pages: [],
    activePageIndex: 0,
  },

  // Save feedback
  saveSuccessInfo: null,
};

export const activeBookSlice = createSlice({
  name: 'activeBook',
  initialState,
  reducers: {
    setCurrentBook: (state, action) => {
      state.currentBook = action.payload;
      if (action.payload?.flipbookName) {
        state.bookName = action.payload.flipbookName;
      }
      if (action.payload?.v_id) {
        state.v_id = action.payload.v_id;
      }
      if (action.payload?.folderName || action.payload?.folder) {
        state.folder = action.payload.folderName || action.payload.folder;
      }
    },
    setBookName: (state, action) => {
      state.bookName = action.payload;
      state.hasUnsavedChanges = true;
    },
    setFolder: (state, action) => {
      state.folder = action.payload;
    },
    setHasUnsavedChanges: (state, action) => {
      state.hasUnsavedChanges = Boolean(action.payload);
    },
    setIsSaving: (state, action) => {
      state.isSaving = Boolean(action.payload);
    },
    toggleAutoSave: (state, action) => {
      const nextVal = action.payload !== undefined ? Boolean(action.payload) : !state.isAutoSaveEnabled;
      state.isAutoSaveEnabled = nextVal;
      try {
        localStorage.setItem('isAutoSaveEnabled', JSON.stringify(nextVal));
      } catch {}
    },
    setActiveDevice: (state, action) => {
      state.activeDevice = action.payload;
    },
    triggerSave: (state) => {
      state.saveTriggerCount += 1;
    },
    triggerExport: (state) => {
      state.exportTriggerCount += 1;
    },
    triggerClear: (state) => {
      state.clearTriggerCount += 1;
    },
    triggerPreview: (state) => {
      state.previewTriggerCount += 1;
    },
    setExportContext: (state, action) => {
      state.exportContext = {
        pages: action.payload.pages || [],
        activePageIndex: action.payload.activePageIndex || 0,
      };
    },
    setSaveSuccessInfo: (state, action) => {
      state.saveSuccessInfo = action.payload;
      state.hasUnsavedChanges = false;
      state.isSaving = false;
    },
    resetActiveBook: (state) => {
      return {
        ...initialState,
        isAutoSaveEnabled: state.isAutoSaveEnabled,
      };
    },
  },
});

export const {
  setCurrentBook,
  setBookName,
  setFolder,
  setHasUnsavedChanges,
  setIsSaving,
  toggleAutoSave,
  setActiveDevice,
  triggerSave,
  triggerExport,
  triggerClear,
  triggerPreview,
  setExportContext,
  setSaveSuccessInfo,
  resetActiveBook,
} = activeBookSlice.actions;

export default activeBookSlice.reducer;
