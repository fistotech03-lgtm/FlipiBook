import { useSelector, useDispatch } from 'react-redux';
import {
  openAuthModal,
  closeAuthModal,
  setAuthModalMode,
  setUser,
  setIsAuthenticated,
  checkAuth,
  logoutUser,
  logout,
} from './slices/authSlice';

import {
  openModal,
  closeModal,
  setModalOpen,
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
} from './slices/uiModalSlice';

import {
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
} from './slices/activeBookSlice';

import {
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
} from './slices/pageEditorSlice';

import {
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
} from './slices/customizedEditorSlice';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// ── Auth Hook ────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    ...auth,
    checkAuth: () => dispatch(checkAuth()).unwrap(),
    logout: async () => {
      try {
        await dispatch(logoutUser());
      } catch (e) {
        console.warn('Logout warning:', e);
      } finally {
        dispatch(logout());
      }
    },
    openAuthModal: (mode = 'signin', redirectPath = null) =>
      dispatch(openAuthModal({ mode, redirectPath })),
    closeAuthModal: () => dispatch(closeAuthModal()),
    setAuthModalMode: (mode) => dispatch(setAuthModalMode(mode)),
    setUser: (user) => dispatch(setUser(user)),
    setIsAuthenticated: (status) => dispatch(setIsAuthenticated(status)),
  };
};

// ── UI & Modals Hook ─────────────────────────────────────────────────────────
export const useUIModals = () => {
  const dispatch = useDispatch();
  const uiModal = useSelector((state) => state.uiModal);

  return {
    ...uiModal,
    openModal: (modalName) => dispatch(openModal(modalName)),
    closeModal: (modalName) => dispatch(closeModal(modalName)),
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen({ modalName, isOpen })),
    showAlert: (config) => dispatch(showAlertModal(config)),
    closeAlert: () => dispatch(closeAlertModal()),
    setActivePopup: (popupName) => dispatch(setActivePopup(popupName)),
    closeAllPopups: () => dispatch(closeAllPopups()),
    setIsFullscreen: (val) => dispatch(setIsFullscreen(val)),
    setZoomLevel: (val) => dispatch(setZoomLevel(val)),
    toggleAudioMute: () => dispatch(toggleAudioMute()),
    setIsAudioMuted: (val) => dispatch(setIsAudioMuted(val)),
    setIsAutoFlipping: (val) => dispatch(setIsAutoFlipping(val)),
    toggleThumbnailBar: () => dispatch(toggleThumbnailBar()),
    setShowThumbnailBar: (val) => dispatch(setShowThumbnailBar(val)),
    toggleTOC: () => dispatch(toggleTOC()),
    setShowTOC: (val) => dispatch(setShowTOC(val)),
  };
};

// ── Active Book Hook ─────────────────────────────────────────────────────────
export const useActiveBook = () => {
  const dispatch = useDispatch();
  const activeBook = useSelector((state) => state.activeBook);

  return {
    ...activeBook,
    setCurrentBook: (bookOrUpdater) => {
      const next = typeof bookOrUpdater === 'function' ? bookOrUpdater(activeBook.currentBook) : bookOrUpdater;
      dispatch(setCurrentBook(next));
    },
    setBookName: (nameOrUpdater) => {
      const next = typeof nameOrUpdater === 'function' ? nameOrUpdater(activeBook.bookName) : nameOrUpdater;
      dispatch(setBookName(next));
    },
    setFolder: (folderOrUpdater) => {
      const next = typeof folderOrUpdater === 'function' ? folderOrUpdater(activeBook.folder) : folderOrUpdater;
      dispatch(setFolder(next));
    },
    setHasUnsavedChanges: (valOrUpdater) => {
      const next = typeof valOrUpdater === 'function' ? valOrUpdater(activeBook.hasUnsavedChanges) : valOrUpdater;
      dispatch(setHasUnsavedChanges(next));
    },
    setIsSaving: (valOrUpdater) => {
      const next = typeof valOrUpdater === 'function' ? valOrUpdater(activeBook.isSaving) : valOrUpdater;
      dispatch(setIsSaving(next));
    },
    toggleAutoSave: (val) => dispatch(toggleAutoSave(val)),
    setActiveDevice: (device) => dispatch(setActiveDevice(device)),
    triggerSave: () => dispatch(triggerSave()),
    triggerExport: () => dispatch(triggerExport()),
    triggerClear: () => dispatch(triggerClear()),
    triggerPreview: () => dispatch(triggerPreview()),
    setExportContext: (ctx) => dispatch(setExportContext(ctx)),
    setSaveSuccessInfo: (info) => dispatch(setSaveSuccessInfo(info)),
    resetActiveBook: () => dispatch(resetActiveBook()),
  };
};

// ── Page Editor Hook ─────────────────────────────────────────────────────────
export const usePageEditorState = () => {
  const dispatch = useDispatch();
  const pageEditor = useSelector((state) => state.pageEditor);

  return {
    ...pageEditor,
    setActiveMainTool: (tool) => dispatch(setActiveMainTool(tool)),
    setActiveTopTool: (tool) => dispatch(setActiveTopTool(tool)),
    setCurrentFrameId: (frameId) => dispatch(setCurrentFrameId(frameId)),
    setSelectedLayerId: (layerId) => dispatch(setSelectedLayerId(layerId)),
    setMultiSelectedIds: (ids) => dispatch(setMultiSelectedIds(ids)),
    setIsDoublePage: (val) => dispatch(setIsDoublePage(val)),
    setIsRulerEnabled: (val) => dispatch(setIsRulerEnabled(val)),
    setIsTrimView: (val) => dispatch(setIsTrimView(val)),
    setActivePageIndex: (idx) => dispatch(setActivePageIndex(idx)),
    setFlipbookDimensions: (dims) => dispatch(setFlipbookDimensions(dims)),
    setIs3DModalOpen: (val) => dispatch(setIs3DModalOpen(val)),
    setPreview3DDataUrl: (url) => dispatch(setPreview3DDataUrl(url)),
    setCurrent3DVId: (vId) => dispatch(setCurrent3DVId(vId)),
    set3DInspectorField: (field, value) => dispatch(set3DInspectorField({ field, value })),
    set3DInspectorValues: (values) => dispatch(set3DInspectorValues(values)),
    setActive3DHotspotId: (id) => dispatch(setActive3DHotspotId(id)),
    setCurrent3DHotspots: (hs) => dispatch(setCurrent3DHotspots(hs)),
    resetPageEditorState: () => dispatch(resetPageEditorState()),
  };
};

// ── Customizer State Hook ────────────────────────────────────────────────────
export const useCustomizerState = () => {
  const dispatch = useDispatch();
  const customizer = useSelector((state) => state.customizedEditor);

  return {
    ...customizer,
    setActiveSubView: (view) => dispatch(setActiveSubView(view)),
    setIsPanelCollapsed: (val) => dispatch(setIsPanelCollapsed(val)),
    togglePanelCollapsed: () => dispatch(togglePanelCollapsed()),
    setDeviceTargetPage: (device, pageNum) => dispatch(setDeviceTargetPage({ device, pageNum })),
    setTargetPageDirect: (pageNum) => dispatch(setTargetPageDirect(pageNum)),
    updateSectionSettings: (section, data) => dispatch(updateSectionSettings({ section, data })),
    setSectionSettings: (section, value) => dispatch(setSectionSettings({ section, value })),
    setBookmarks: (bms) => dispatch(setBookmarks(bms)),
    setNotes: (nts) => dispatch(setNotes(nts)),
    setIsDataLoaded: (val) => dispatch(setIsDataLoaded(val)),
    loadAllCustomizerSettings: (settings) => dispatch(loadAllCustomizerSettings(settings)),
    resetCustomizerState: () => dispatch(resetCustomizerState()),
  };
};
