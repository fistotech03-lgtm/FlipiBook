import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

const AddShelfModal = ({
  isOpen,
  onClose,
  isCreating = false,
  newShelfName,
  setNewShelfName,
  onAddShelf
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const isNameValid = Boolean(newShelfName && newShelfName.trim().length > 0);

  const handleKeyDown = (e) => {
    if (isCreating) return;
    if (e.key === 'Enter' && isNameValid) {
      e.preventDefault();
      onAddShelf();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-[1vw]">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!isCreating) onClose();
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-[1vw] p-[1.25vw] md:p-[1.5vw] w-full max-w-[26vw] mx-auto flex flex-col shadow-2xl relative border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between pb-[0.75vw] mb-[0.5vw] border-b border-gray-200">
                <h2 className="text-[1.25vw] font-bold text-gray-900">Create New Shelf</h2>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isCreating}
                  className="absolute top-[1vw] right-[1vw] text-[#ea543a] hover:text-[#d9482f] transition-colors z-50 p-[0.25vw] hover:bg-[#ea543a]/10 rounded-[0.35vw] border border-[#ea543a] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Close"
                >
                  <X size="1.05vw" strokeWidth={2} />
                </button>
              </div>

              {/* Subtitle */}
              <p className="text-[0.65vw] text-gray-500 mb-[1vw] leading-relaxed pr-[1vw]">
                Organize your digital flipbooks on custom styled shelves to share with clients.
              </p>

              {/* Shelf Name Input */}
              <div className="mb-[1.5vw]">
                <label className="block text-[0.7vw] font-bold text-gray-800 mb-[0.4vw]">
                  Shelf Name <span className="text-[#ea543a]">*</span>
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isCreating}
                  placeholder="Enter shelf name..."
                  className="w-full border rounded-[0.5vw] px-[0.75vw] py-[0.5vw] text-[0.75vw] border-gray-300 text-gray-700 focus:border-[#ea543a] focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-[1vw] mt-auto pt-[0.5vw]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isCreating}
                  className="flex-1 py-[0.6vw] cursor-pointer border border-gray-300 text-gray-700 font-semibold rounded-[0.5vw] text-[0.85vw] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onAddShelf}
                  disabled={!isNameValid || isCreating}
                  className={`flex-1 py-[0.6vw] font-semibold rounded-[0.5vw] text-[0.85vw] transition-all flex items-center justify-center gap-[0.4vw] ${
                    isNameValid && !isCreating
                      ? 'bg-[#ea543a] text-white hover:bg-[#d9482f] shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer'
                      : 'bg-[#ffedea] text-[#ea543a]/50 cursor-not-allowed'
                  }`}
                >
                  {isCreating ? (
                    <>
                      <Icon icon="eos-icons:loading" className="w-[1vw] h-[1vw]" />
                      <span>Creating Shelf...</span>
                    </>
                  ) : (
                    <span>Create Shelf</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddShelfModal;
