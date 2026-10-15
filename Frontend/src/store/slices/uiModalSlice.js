import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Global & Editor Modals
  isExportModalOpen: false,
  isPublishModalOpen: false,
  isShareModalOpen: false,
  isFlipbookInfoModalOpen: false,
  isTemplateModalOpen: false,
  isUnpublishWarningOpen: false,
  isClearWarningOpen: false,
  isDeleteWarningOpen: false,
  isProfileModalOpen: false,
  isEditorSettingsModalOpen: false,

  // Alert Modal Config
  alertModal: {
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info' | 'error' | 'warning' | 'success'
    confirmText: 'OK',
    cancelText: null,
    showCancel: false,
  },

  // Customized Editor & Preview Area Popups
  // 'sound' | 'gallery' | 'share' | 'export' | 'profile' | 'bookmarks' | 'notes' | 'toc' | 'more' | null
  activePopup: null,

  // Preview Layout Controls
  isFullscreen: false,
  zoomLevel: 1.0,
  isAudioMuted: false,
  isAutoFlipping: false,
  showThumbnailBar: false,
  showTOC: false,
};

export const uiModalSlice = createSlice({
  name: 'uiModal',
  initialState,
  reducers: {
    setModalOpen: (state, action) => {
      const { modalName, isOpen } = action.payload;
      if (modalName in state) {
        state[modalName] = Boolean(isOpen);
      }
    },
    openModal: (state, action) => {
      const modalName = action.payload;
      if (modalName in state) {
        state[modalName] = true;
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (modalName in state) {
        state[modalName] = false;
      }
    },
    showAlertModal: (state, action) => {
      state.alertModal = {
        isOpen: true,
        title: action.payload.title || '',
        message: action.payload.message || '',
        type: action.payload.type || 'info',
        confirmText: action.payload.confirmText || 'OK',
        cancelText: action.payload.cancelText || null,
        showCancel: Boolean(action.payload.showCancel),
      };
    },
    closeAlertModal: (state) => {
      state.alertModal.isOpen = false;
    },
    setActivePopup: (state, action) => {
      // Toggle if the same popup is clicked, otherwise switch
      state.activePopup = state.activePopup === action.payload ? null : action.payload;
    },
    closeAllPopups: (state) => {
      state.activePopup = null;
      state.showThumbnailBar = false;
      state.showTOC = false;
    },
    setIsFullscreen: (state, action) => {
      state.isFullscreen = Boolean(action.payload);
    },
    setZoomLevel: (state, action) => {
      state.zoomLevel = action.payload;
    },
    toggleAudioMute: (state) => {
      state.isAudioMuted = !state.isAudioMuted;
    },
    setIsAudioMuted: (state, action) => {
      state.isAudioMuted = Boolean(action.payload);
    },
    setIsAutoFlipping: (state, action) => {
      state.isAutoFlipping = Boolean(action.payload);
    },
    toggleThumbnailBar: (state) => {
      state.showThumbnailBar = !state.showThumbnailBar;
    },
    setShowThumbnailBar: (state, action) => {
      state.showThumbnailBar = Boolean(action.payload);
    },
    toggleTOC: (state) => {
      state.showTOC = !state.showTOC;
    },
    setShowTOC: (state, action) => {
      state.showTOC = Boolean(action.payload);
    },
  },
});

export const {
  setModalOpen,
  openModal,
  closeModal,
  showAlertModal,
  closeAlertModal,
  setActivePopup,
  closeAllPopups,
  setIsFullscreen,
  setZoomLevel,
  toggleAudioMute,
  setIsAudioMuted,
  setIsAutoFlipping,
  toggleThumbnailBar,
  setShowThumbnailBar,
  toggleTOC,
  setShowTOC,
} = uiModalSlice.actions;

export default uiModalSlice.reducer;
