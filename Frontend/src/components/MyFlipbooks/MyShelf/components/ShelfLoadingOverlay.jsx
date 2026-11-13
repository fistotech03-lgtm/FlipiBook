import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ShelfLoadingOverlay = ({
  isLoading,
  title = 'Loading Bookshelf...',
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#151C28] text-white select-none ${className}`}
        >
          <div className="w-12 h-12 border-4 border-[#FF5733] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            {title || 'Loading Bookshelf...'}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShelfLoadingOverlay;
