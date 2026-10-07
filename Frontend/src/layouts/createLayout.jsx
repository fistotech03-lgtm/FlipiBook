import React, { createContext, useContext, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import CreateFlipbookModal from '../components/CreateFlipbookModal';

const CreateFlipbookContext = createContext(null);

export const useCreateFlipbook = () => {
  const context = useContext(CreateFlipbookContext);
  return context;
};

export default function CreateLayout({
  children,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onUpload: controlledOnUpload,
  onTemplate: controlledOnTemplate,
  initialView: controlledInitialView = 'upload',
  initialTemplateId,
  existingFlipbooks = [],
  initialFiles = null
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [modalView, setModalView] = useState('upload');
  const [droppedFiles, setDroppedFiles] = useState(null);

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const openCreateModal = useCallback((view = 'upload', files = null) => {
    setModalView(view);
    setDroppedFiles(files);
    setInternalIsOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setInternalIsOpen(false);
    setDroppedFiles(null);
    if (controlledOnClose) controlledOnClose();
  }, [controlledOnClose]);

  const handleUpload = useCallback((files, name, dims) => {
    if (controlledOnUpload) {
      controlledOnUpload(files, name, dims);
    }
  }, [controlledOnUpload]);

  const handleTemplate = useCallback((templateData) => {
    if (controlledOnTemplate) {
      controlledOnTemplate(templateData);
    }
  }, [controlledOnTemplate]);

  const contextValue = {
    isCreateModalOpen: isModalOpen,
    openCreateModal,
    closeCreateModal,
    setIsCreateModalOpen: setInternalIsOpen
  };

  return (
    <CreateFlipbookContext.Provider value={contextValue}>
      <div className="create-layout-root w-full h-full min-h-0 flex flex-col">
        {children ? children : <Outlet context={contextValue} />}
        
        <CreateFlipbookModal
          isOpen={isModalOpen}
          onClose={closeCreateModal}
          onUpload={handleUpload}
          onTemplate={handleTemplate}
          initialView={controlledInitialView || modalView}
          initialTemplateId={initialTemplateId}
          existingFlipbooks={existingFlipbooks}
          initialFiles={initialFiles || droppedFiles}
        />
      </div>
    </CreateFlipbookContext.Provider>
  );
}
