import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeSubView: null,
  isPanelCollapsed: false,
  devicePages: { Desktop: 0, Tablet: 0, Mobile: 0 },
  targetPage: 0,

  // Customization Sections
  logoSettings: null,
  watermarkSettings: null,
  preloaderSettings: null,
  profileSettings: null,
  backgroundSettings: null,
  bookAppearanceSettings: null,
  layoutSettings: null,
  layoutColors: null,
  menuBarSettings: null,
  leadFormSettings: null,
  visibilitySettings: null,
  shareSettings: null,
  otherSetupSettings: null,

  // User Content
  bookmarks: [],
  notes: [],
  isDataLoaded: false,
};

export const customizedEditorSlice = createSlice({
  name: 'customizedEditor',
  initialState,
  reducers: {
    setActiveSubView: (state, action) => {
      state.activeSubView = action.payload;
      state.isPanelCollapsed = false;
    },
    setIsPanelCollapsed: (state, action) => {
      state.isPanelCollapsed = Boolean(action.payload);
    },
    togglePanelCollapsed: (state) => {
      state.isPanelCollapsed = !state.isPanelCollapsed;
    },
    setDeviceTargetPage: (state, action) => {
      const { device, pageNum } = action.payload;
      state.devicePages[device || 'Desktop'] = pageNum;
      state.targetPage = pageNum;
    },
    setTargetPageDirect: (state, action) => {
      state.targetPage = action.payload;
    },
    updateSectionSettings: (state, action) => {
      const { section, data } = action.payload;
      if (section in state) {
        state[section] = { ...(state[section] || {}), ...data };
      }
    },
    setSectionSettings: (state, action) => {
      const { section, value } = action.payload;
      if (section in state) {
        state[section] = value;
      }
    },
    setBookmarks: (state, action) => {
      state.bookmarks = action.payload || [];
    },
    setNotes: (state, action) => {
      state.notes = action.payload || [];
    },
    setIsDataLoaded: (state, action) => {
      state.isDataLoaded = Boolean(action.payload);
    },
    loadAllCustomizerSettings: (state, action) => {
      const payload = action.payload || {};
      Object.keys(payload).forEach((key) => {
        if (key in state && payload[key] !== undefined) {
          state[key] = payload[key];
        }
      });
      state.isDataLoaded = true;
    },
    resetCustomizerState: () => initialState,
  },
});

export const {
  setActiveSubView,
  setIsPanelCollapsed,
  togglePanelCollapsed,
  setDeviceTargetPage,
  setTargetPageDirect,
  updateSectionSettings,
  setSectionSettings,
  setBookmarks,
  setNotes,
  setIsDataLoaded,
  loadAllCustomizerSettings,
  resetCustomizerState,
} = customizedEditorSlice.actions;

export default customizedEditorSlice.reducer;
