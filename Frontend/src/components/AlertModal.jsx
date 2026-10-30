import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  type = 'danger', 
  title, 
  message, 
  showCancel = false,
  confirmText = 'Okay',
  cancelText = 'Cancel',
  autoClose = false,
  autoCloseDuration = 3000,
  isLoading = false
}) => {
  useEffect(() => {
    if (isOpen && autoClose && !showCancel) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDuration, onClose, showCancel]);

  if (!isOpen) return null;

  const confirmBtnBg = {
    danger: 'bg-[#ea543a] hover:bg-[#d9482f] text-white shadow-sm shadow-orange-500/20',
    error: 'bg-[#ea543a] hover:bg-[#d9482f] text-white shadow-sm shadow-orange-500/20',
    warning: 'bg-[#ea543a] hover:bg-[#d9482f] text-white shadow-sm shadow-orange-500/20',
    success: 'bg-gray-900 hover:bg-black text-white shadow-sm',
    info: 'bg-gray-900 hover:bg-black text-white shadow-sm'
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-[1vw] bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[0.8vw] shadow-[0_16px_48px_rgba(0,0,0,0.16)] w-full max-w-[24vw] p-[1.5vw] border border-gray-100 flex flex-col transform scale-100 animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Title (Clean & Icon-free) */}
        {title && (
          <h3 className="text-[1.05vw] font-bold text-gray-900 leading-snug tracking-tight">
            {title}
          </h3>
        )}

        {/* Message */}
        {message && (
          <p className="text-[0.82vw] text-gray-600 font-normal leading-[1.55] mt-[0.6vw] whitespace-pre-wrap">
            {message}
          </p>
        )}
        
        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-[0.75vw] mt-[1.5vw]">
          {showCancel && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-[1.1vw] py-[0.55vw] text-[0.8vw] cursor-pointer font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-[0.5vw] transition-colors border border-transparent outline-none focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
            disabled={isLoading}
            className={`px-[1.25vw] py-[0.55vw] text-[0.8vw] cursor-pointer font-semibold rounded-[0.5vw] transition-all outline-none focus:outline-none flex items-center justify-center gap-[0.5vw] active:scale-[0.98] ${confirmBtnBg[type] || confirmBtnBg.danger} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading && (
              <div className="w-[0.8vw] h-[0.8vw] border-[0.1vw] border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? (confirmText === 'Delete' ? 'Deleting...' : 'Loading...') : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertModal;
