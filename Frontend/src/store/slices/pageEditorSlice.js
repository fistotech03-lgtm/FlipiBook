import { createSlice } from '@reduxjs/toolkit';

const getInitialBool = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const initialState = {
  // Canvas View & Modes
  activeMainTool: 'select',
  activeTopTool: 'editor',
  currentFrameId: null,
  selectedLayerId: null,
  multiSelectedIds: [],
  isDoublePage: false,
  isRulerEnabled: getInitialBool('isRulerEnabled', true),
  isTrimView: getInitialBool('isTrimViewEnabled', false),
  activePageIndex: 0,
  flipbookDimensions: { width: 800, height: 600 },

  // 3D Preview Inspector & Modal Controls
  is3DModalOpen: false,
  preview3DDataUrl: null,
  current3DVId: null,
  shadowStrength: 0.5,
  shadowSoftness: 0.5,
  autoRotate: false,
  autoRotateSpeed: 1,
  lockMaxZoom: false,
  maxZoom: 3,
  bgType: 'color',
  bgColor: '#ffffff',
  customBg: null,
  enableAR: false,
  qrText: '',
  qrColor: '#000000',
  qrBgType: 'color',
  qrBgColor: '#ffffff',
  qrLevel: 'M',
  qrDotType: 'square',
  qrCornerSquareType: 'square',
  qrCornerDotType: 'dot',
  qrLogo: null,
  topText: '',
  bottomText: '',
  active3DHotspotId: null,
  current3DHotspots: [],
};

export const pageEditorSlice = createSlice({
  name: 'pageEditor',
  initialState,
  reducers: {
    setActiveMainTool: (state, action) => {
      state.activeMainTool = action.payload;
    },
    setActiveTopTool: (state, action) => {
      state.activeTopTool = action.payload;
      if (action.payload !== 'editor') {
        state.activeMainTool = 'select';
      }
    },
    setCurrentFrameId: (state, action) => {
      state.currentFrameId = action.payload;
    },
    setSelectedLayerId: (state, action) => {
      state.selectedLayerId = action.payload;
    },
    setMultiSelectedIds: (state, action) => {
      state.multiSelectedIds = Array.isArray(action.payload)
        ? action.payload
        : Array.from(action.payload || []);
    },
    setIsDoublePage: (state, action) => {
      state.isDoublePage = Boolean(action.payload);
    },
    setIsRulerEnabled: (state, action) => {
      state.isRulerEnabled = Boolean(action.payload);
      try {
        localStorage.setItem('isRulerEnabled', JSON.stringify(state.isRulerEnabled));
      } catch {}
    },
    setIsTrimView: (state, action) => {
      state.isTrimView = Boolean(action.payload);
      try {
        localStorage.setItem('isTrimViewEnabled', JSON.stringify(state.isTrimView));
      } catch {}
    },
    setActivePageIndex: (state, action) => {
      state.activePageIndex = action.payload;
    },
    setFlipbookDimensions: (state, action) => {
      state.flipbookDimensions = action.payload;
    },

    // 3D Inspector Reducers
    setIs3DModalOpen: (state, action) => {
      state.is3DModalOpen = Boolean(action.payload);
    },
    setPreview3DDataUrl: (state, action) => {
      state.preview3DDataUrl = action.payload;
    },
    setCurrent3DVId: (state, action) => {
      state.current3DVId = action.payload;
    },
    set3DInspectorField: (state, action) => {
      const { field, value } = action.payload;
      if (field in state) {
        state[field] = value;
      }
    },
    set3DInspectorValues: (state, action) => {
      Object.assign(state, action.payload);
    },
    setActive3DHotspotId: (state, action) => {
      state.active3DHotspotId = action.payload;
    },
    setCurrent3DHotspots: (state, action) => {
      state.current3DHotspots = action.payload || [];
    },
    resetPageEditorState: () => initialState,
  },
});

export const {
  setActiveMainTool,
  setActiveTopTool,
  setCurrentFrameId,
  setSelectedLayerId,
  setMultiSelectedIds,
  setIsDoublePage,
  setIsRulerEnabled,
  setIsTrimView,
  setActivePageIndex,
  setFlipbookDimensions,
  setIs3DModalOpen,
  setPreview3DDataUrl,
  setCurrent3DVId,
  set3DInspectorField,
  set3DInspectorValues,
  setActive3DHotspotId,
  setCurrent3DHotspots,
  resetPageEditorState,
} = pageEditorSlice.actions;

export default pageEditorSlice.reducer;
