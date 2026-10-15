import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import EditorNavbar from '../components/NavBar/EditorNav';
import AlertModal from '../components/AlertModal';
const ExportModal = React.lazy(() => import('../components/ExportModal'));
const PublishModal = React.lazy(() => import('../components/PublishModal'));
import axios from 'axios';
import { getFromDB, saveToDB } from '../utils/dbUtils';
import { useAuth, useActiveBook, useUIModals } from '../store/hooks';

const STATE_KEY = 'threed_editor_state';

const EditorLayout = () => {
  const { user } = useAuth();
  const {
    currentBook,
    setCurrentBook,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isSaving,
    setIsSaving,
    isAutoSaveEnabled,
    toggleAutoSave: dispatchToggleAutoSave,
    activeDevice,
    setActiveDevice,
    saveSuccessInfo,
    setSaveSuccessInfo,
    exportContext,
    setExportContext,
    triggerSave,
    triggerExport,
    triggerClear,
    triggerPreview,
  } = useActiveBook();

  const {
    isExportModalOpen,
    isPublishModalOpen,
    isUnpublishWarningOpen,
    isClearWarningOpen,
    isDeleteWarningOpen,
    setModalOpen,
  } = useUIModals();

  // Sync state with backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
          const res = await axios.get(`${backendUrl}/api/usersetting/get-settings`, {
            params: { emailId: user.emailId || user.email }
          });
          
          if (res.data) {
            const editorSettings = res.data.editorSettings;
            const autoSaveVal = editorSettings?.isAutoSaveEnabled ?? res.data.isAutoSaveEnabled;
            if (autoSaveVal !== undefined) {
              dispatchToggleAutoSave(autoSaveVal);
            }
            if (editorSettings) {
              if (editorSettings.isTrimViewEnabled !== undefined) {
                localStorage.setItem('isTrimViewEnabled', JSON.stringify(editorSettings.isTrimViewEnabled));
                window.dispatchEvent(new CustomEvent('editor_toggleTrimView', { detail: editorSettings.isTrimViewEnabled }));
              }
              if (editorSettings.isRulerEnabled !== undefined) {
                localStorage.setItem('isRulerEnabled', JSON.stringify(editorSettings.isRulerEnabled));
                window.dispatchEvent(new CustomEvent('editor_toggleRuler', { detail: editorSettings.isRulerEnabled }));
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch user settings", err);
        }
      }
    };
    fetchSettings();
  }, [user]);

  const toggleAutoSave = async (value) => {
    dispatchToggleAutoSave(value);
    
    try {
      if (user) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        
        await axios.post(`${backendUrl}/api/usersetting/update-editor-settings`, {
          emailId: user.emailId || user.email,
          editorSettings: { isAutoSaveEnabled: value }
        });
      }
    } catch (error) {
      console.error("Failed to sync auto-save preference:", error);
    }
  };

  const navigate = useNavigate();
  const exportHandlerRef = useRef(null);
  const saveHandlerRef = useRef(null);
  const previewHandlerRef = useRef(null);
  const clearHandlerRef = useRef(null);

  const setExportHandler = useCallback((fn) => {
    exportHandlerRef.current = typeof fn === 'function' ? fn() : fn;
  }, []);
  const setSaveHandler = useCallback((fn) => {
    saveHandlerRef.current = typeof fn === 'function' ? fn() : fn;
  }, []);
  const setPreviewHandler = useCallback((fn) => {
    previewHandlerRef.current = typeof fn === 'function' ? fn() : fn;
  }, []);
  const setClearHandler = useCallback((fn) => {
    clearHandlerRef.current = typeof fn === 'function' ? fn() : fn;
  }, []);
  const [canSave, setCanSave] = useState(true);

  // Prevent closing the tab if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleSaveSuccess = (info) => {
    setSaveSuccessInfo(info);
    setTimeout(() => {
      setSaveSuccessInfo(null);
    }, 3000);
  };

  const handleExport = () => {
    setModalOpen('isExportModalOpen', true);
    triggerExport();
    if (exportHandlerRef.current) {
      exportHandlerRef.current();
    }
  };

  const handleSave = () => {
    triggerSave();
    if (saveHandlerRef.current) {
      saveHandlerRef.current();
    }
  };

  const handlePreview = () => {
    triggerPreview();
    if (previewHandlerRef.current) {
      previewHandlerRef.current();
    }
  };

  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const handlePublish = () => {
    const isBookPublished = Boolean(
      currentBook?.isPublished || 
      currentBook?.published || 
      currentBook?.is_published || 
      currentBook?.status === 'publish' ||
      currentBook?.status === 'published' ||
      currentBook?.meta?.isPublished
    );

    if (isBookPublished) {
      setModalOpen('isUnpublishWarningOpen', true);
    } else {
      setModalOpen('isPublishModalOpen', true);
    }
  };

  const confirmUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const v_id = currentBook?.v_id || currentBook?.realName;
      const userEmail = user?.emailId || user?.email || currentBook?.userEmail;

      if (userEmail && v_id) {
        await axios.post(`${backendUrl}/api/flipbook/unpublish`, {
          emailId: userEmail,
          v_id: v_id
        });
      }
      setCurrentBook(prev => ({
        ...(prev || {}),
        isPublished: false,
        tags: [],
        meta: {
          ...(prev?.meta || {}),
          tags: [],
          isPublished: false
        }
      }));
    } catch (err) {
      console.error("Failed to unpublish flipbook:", err);
    } finally {
      setIsUnpublishing(false);
      setModalOpen('isUnpublishWarningOpen', false);
    }
  };

  const [isClearing, setIsClearing] = useState(false);

  const handleClearFlipbook = () => {
    setModalOpen('isClearWarningOpen', true);
  };

  const confirmClear = async () => {
    setIsClearing(true);
    try {
      if (clearHandlerRef.current) {
        clearHandlerRef.current();
      } else {
        window.dispatchEvent(new CustomEvent('trigger-clear-flipbook'));
      }
    } catch (err) {
      console.error("Failed to clear flipbook:", err);
    } finally {
      setIsClearing(false);
      setModalOpen('isClearWarningOpen', false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteFlipbook = () => {
    setModalOpen('isDeleteWarningOpen', true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const emailId = user?.emailId || user?.email || currentBook?.userEmail;

      const pathParts = window.location.pathname.split('/');
      const folderName = currentBook?.folder || currentBook?.folderName || (pathParts.length >= 4 ? decodeURIComponent(pathParts[3]) : 'My_Flipbooks');
      const bookName = currentBook?.flipbookName || currentBook?.realName || currentBook?.title || (pathParts.length >= 5 ? decodeURIComponent(pathParts[4]) : '');

      if (emailId && bookName) {
        await axios.delete(`${backendUrl}/api/flipbook/delete`, {
          data: {
            emailId: emailId,
            folderName: Array.isArray(folderName) ? folderName[0] : folderName,
            bookName: bookName
          }
        });
      }
      navigate('/my-flipbooks');
    } catch (err) {
      console.error("Failed to delete flipbook:", err);
    } finally {
      setIsDeleting(false);
      setModalOpen('isDeleteWarningOpen', false);
    }
  };

  // 3D Editor Persistence State
  const [threedState, setThreedState] = useState({
    modelUrl: null,
    modelFile: null,
    modelType: 'glb',
    modelStats: {
      vertexCount: "0",
      polygonCount: "0",
      materialCount: "0",
      fileSize: "0 MB",
      dimensions: "0 X 0 X 0 unit"
    },
    transformValues: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    },
    materialSettings: {
      alpha: 100, metallic: 0, roughness: 50, normal: 100, bump: 100, scale: 4, rotation: 0,
      specular: 50, reflection: 50, shadow: 50, softness: 50, ao: 100, environment: 'studio',
      worldOpacity: 0, worldBlur: 0,
      color: '#ffffff', useFactorColor: false, autoUnwrap: false, envRotation: 0, offset: { x: 0, y: 0 },
      lightPosition: { x: 10, y: 10, z: 10 }
    },
    modelName: "",
    materialList: [],
  });

  // Restore State from IndexedDB on Mount (Commented out: focus only on page_editor and customized_editor)
  /*
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await getFromDB(STATE_KEY);
        if (savedState) {
          let restoredUrl = null;
          if (savedState.modelFile instanceof Blob) {
            restoredUrl = URL.createObjectURL(savedState.modelFile);
          }
          
          let restoredModels = savedState.models;
          if (restoredModels && Array.isArray(restoredModels)) {
            restoredModels = restoredModels.map(m => {
              if (m.file instanceof Blob) {
                return { ...m, url: URL.createObjectURL(m.file) };
              }
              return m;
            });
          }
          
          setThreedState({
            ...savedState,
            modelUrl: restoredUrl || savedState.modelUrl,
            models: restoredModels
          });
        }
      } catch (e) {
        console.error("Failed to restore 3D state", e);
      }
    };
    
    loadState();
  }, []);
  */

  // Save State to IndexedDB on Change (Commented out: focus only on page_editor and customized_editor)
  /*
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const stateToSave = {
        ...threedState,
        modelUrl: threedState.modelUrl?.startsWith('blob:') ? null : threedState.modelUrl
      };
      if (stateToSave.models && Array.isArray(stateToSave.models)) {
        stateToSave.models = stateToSave.models.map(m => ({ 
          ...m, 
          url: m.url?.startsWith('blob:') ? null : m.url 
        }));
      }
      saveToDB(STATE_KEY, stateToSave);
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [threedState]);
  */

  // Cleanup 3D Model URL on unmount
  useEffect(() => {
    return () => {
      if (threedState.modelUrl) {
        URL.revokeObjectURL(threedState.modelUrl);
      }
      if (threedState.models && Array.isArray(threedState.models)) {
        threedState.models.forEach(m => {
          if (m.url) URL.revokeObjectURL(m.url);
        });
      }
    };
  }, []);

  // Memoize context
  const contextValue = React.useMemo(() => ({ 
    setExportHandler, 
    setSaveHandler,
    setPreviewHandler,
    setClearHandler,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    canSave,
    setCanSave,
    triggerSaveSuccess: handleSaveSuccess,
    isAutoSaveEnabled,
    isSaving,
    setIsSaving,
    threedState,
    setThreedState,
    currentBook,
    setCurrentBook,
    activeDevice,
    setActiveDevice,
    isExportModalOpen,
    setExportContext
  }), [isAutoSaveEnabled, isSaving, hasUnsavedChanges, canSave, threedState, currentBook, activeDevice, isExportModalOpen]);

  return (
    <div className="flex flex-col h-screen font-sans">
      <EditorNavbar 
        onExport={handleExport} 
        onSave={handleSave}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onClearFlipbook={handleClearFlipbook}
        onDeleteFlipbook={handleDeleteFlipbook}
        hasUnsavedChanges={hasUnsavedChanges}
        canSave={canSave}
        saveSuccessInfo={saveSuccessInfo}
        isAutoSaveEnabled={isAutoSaveEnabled}
        onToggleAutoSave={toggleAutoSave}
        currentBook={currentBook}
        isSaving={isSaving}
        activeDevice={activeDevice}
        setActiveDevice={setActiveDevice}
      />
      <div className="flex-1 overflow-hidden">
        <Outlet context={contextValue} />
      </div>
      
      {/* Export Modal */}
      {isExportModalOpen && (
        <React.Suspense fallback={null}>
          <ExportModal 
            isOpen={isExportModalOpen} 
            onClose={() => setModalOpen('isExportModalOpen', false)}
            currentBook={currentBook}
            pages={exportContext.pages}
            currentPageIndex={exportContext.activePageIndex}
          />
        </React.Suspense>
      )}

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <React.Suspense fallback={null}>
          <PublishModal 
            isOpen={isPublishModalOpen}
            onClose={() => setModalOpen('isPublishModalOpen', false)}
            currentBook={currentBook}
            onPublishSuccess={(data) => {
              setCurrentBook({
                ...(currentBook || {}),
                ...(data || {}),
                isPublished: true
              });
            }}
          />
        </React.Suspense>
      )}

      {/* Unpublish Warning Modal */}
      <AlertModal 
        isOpen={isUnpublishWarningOpen}
        onClose={() => setModalOpen('isUnpublishWarningOpen', false)}
        onConfirm={confirmUnpublish}
        type="warning"
        title="Unpublish Flipbook"
        message="Are you sure you want to unpublish this flipbook? Unpublishing will clear all tags."
        showCancel={true}
        confirmText="Yes, Unpublish"
        cancelText="Cancel"
        isLoading={isUnpublishing}
      />

      {/* Clear Warning Modal */}
      <AlertModal 
        isOpen={isClearWarningOpen}
        onClose={() => setModalOpen('isClearWarningOpen', false)}
        onConfirm={confirmClear}
        type="warning"
        title="Clear Flipbook"
        message="Are you sure you want to clear all page content from this flipbook? All page elements will be reset."
        showCancel={true}
        confirmText="Yes, Clear"
        cancelText="Cancel"
        isLoading={isClearing}
      />

      {/* Delete Warning Modal */}
      <AlertModal 
        isOpen={isDeleteWarningOpen}
        onClose={() => setModalOpen('isDeleteWarningOpen', false)}
        onConfirm={confirmDelete}
        type="error"
        title="Delete Flipbook"
        message="Are you sure you want to delete this flipbook? This action cannot be undone."
        showCancel={true}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EditorLayout;
