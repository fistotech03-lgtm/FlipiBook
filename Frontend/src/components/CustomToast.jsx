import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastItem = ({ id, message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false); // Trigger exit animation (slide out)
    setTimeout(() => {
      onClose(id);
    }, 300); // Wait for animation to finish before unmounting
  }, [id, onClose]);

  useEffect(() => {
    // Trigger entrance animation (slide in) after mount
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    // Auto-close after 3 seconds, but only if not hovered
    let closeTimer;
    if (!isHovered) {
      closeTimer = setTimeout(() => {
        handleClose();
      }, 3000);
    }

    return () => {
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [isHovered, handleClose]);

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  };

  const icons = {
    success: <CheckCircle className="w-[1.25vw] h-[1.25vw] text-green-500" />,
    error: <AlertCircle className="w-[1.25vw] h-[1.25vw] text-red-500" />,
    info: <Info className="w-[1.25vw] h-[1.25vw] text-blue-500" />,
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex items-start gap-3 p-3.5 md:p-[0.9vw] mb-2 md:mb-[0.6vw] rounded-xl md:rounded-[0.5vw] border shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-in-out transform
        cursor-default max-w-sm sm:max-w-md md:max-w-none
        ${bgColors[type] || bgColors.info}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type] || icons.info}
      </div>
      <div className={`flex-1 text-xs sm:text-sm md:text-[0.82vw] font-medium leading-snug break-words ${textColors[type] || textColors.info}`}>
        {message}
      </div>
      <button
        type="button"
        className={`flex-shrink-0 ml-1 rounded-lg focus:ring-2 p-1 inline-flex items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/20 transition-colors ${textColors[type]}`}
        onClick={handleClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X className="w-4 h-4 md:w-[1vw] md:h-[1vw]" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    showToast: addToast,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[9999] flex flex-col w-[90vw] sm:w-[24rem] md:w-[22vw] pointer-events-none overflow-hidden pr-1 py-1">
        <div className="pointer-events-auto flex flex-col">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              {...toast}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
