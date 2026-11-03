import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmationContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider');
  }
  return context.confirm;
};

export const ConfirmationProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger', // 'danger' | 'primary'
    showCancel: true,
    isLoading: false
  });

  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModalState({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || 'Please confirm to continue.',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'danger',
        showCancel: options.showCancel !== false,
        isLoading: false
      });
    });
  }, []);

  const handleClose = useCallback((result = false) => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const confirmBtnStyles = {
    danger: 'bg-[#ea543a] hover:bg-[#d9482f] text-white shadow-sm shadow-orange-500/20',
    primary: 'bg-gray-900 hover:bg-black text-white shadow-sm',
    info: 'bg-[#ea543a] hover:bg-[#d9482f] text-white shadow-sm'
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {modalState.isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-[1vw]">
              {/* Clean backdrop blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={() => handleClose(false)}
              />

              {/* Simple, Icon-Free Professional Modal Dialog */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                role="alertdialog"
                aria-modal="true"
                className="relative z-10 bg-white rounded-[0.8vw] shadow-[0_16px_48px_rgba(0,0,0,0.16)] w-full max-w-[24vw] p-[1.5vw] border border-gray-100 flex flex-col"
              >
                {/* Title */}
                <h3 className="text-[1.05vw] font-bold text-gray-900 leading-snug tracking-tight">
                  {modalState.title}
                </h3>

                {/* Message Body */}
                <p className="text-[0.82vw] text-gray-600 font-normal leading-[1.55] mt-[0.6vw] whitespace-pre-wrap">
                  {modalState.message}
                </p>

                {/* Simple Action Buttons */}
                <div className="flex items-center justify-end gap-[0.75vw] mt-[1.5vw]">
                  {modalState.showCancel && (
                    <button
                      type="button"
                      onClick={() => handleClose(false)}
                      className="px-[1.1vw] py-[0.55vw] text-[0.8vw] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-[0.5vw] transition-colors cursor-pointer border border-transparent focus:outline-none"
                    >
                      {modalState.cancelText}
                    </button>
                  )}
                  <button
                    type="button"
                    autoFocus
                    onClick={() => handleClose(true)}
                    className={`px-[1.25vw] py-[0.55vw] text-[0.8vw] font-semibold rounded-[0.5vw] transition-all cursor-pointer focus:outline-none active:scale-[0.98] ${confirmBtnStyles[modalState.type] || confirmBtnStyles.danger}`}
                  >
                    {modalState.confirmText}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </ConfirmationContext.Provider>
  );
};

