import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Languages, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';

export default function TranslateBookModal({
  isOpen,
  onClose,
  book,
  onStartTranslation
}) {
  const srcLang = 'eng_Latn';
  const [tgtLang, setTgtLang] = useState('tam_Taml');
  const [newBookTitle, setNewBookTitle] = useState('');

  const originalTitle = book?.flipbookName || book?.title || book?.realName || 'Untitled Flipbook';
  const pageCount = book?.pages?.length || book?.total_pages || 0;

  // Sync title when target language or book changes
  useEffect(() => {
    if (book) {
      const selectedTgt = SUPPORTED_LANGUAGES.find(l => l.code === tgtLang);
      const langLabel = selectedTgt ? selectedTgt.name : 'Translated';
      setNewBookTitle(`[${langLabel}] ${originalTitle}`);
    }
  }, [book, tgtLang, originalTitle]);

  if (!isOpen || !book) return null;

  const handleStart = () => {
    const selectedSrc = SUPPORTED_LANGUAGES.find(l => l.code === srcLang);
    const selectedTgt = SUPPORTED_LANGUAGES.find(l => l.code === tgtLang);

    if (onStartTranslation) {
      const resolvedVId = book.v_id || book.book_v_id || (typeof book.id === 'string' && !book.id.startsWith('Recent_') ? book.id : null) || book._id;
      onStartTranslation({
        v_id: resolvedVId,
        src_lang: srcLang,
        tgt_lang: tgtLang,
        tgt_name: selectedTgt ? selectedTgt.name : tgtLang,
        src_name: selectedSrc ? selectedSrc.name : srcLang,
        newBookName: newBookTitle.trim() || `[${selectedTgt?.name || 'Translated'}] ${originalTitle}`
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99990] flex items-center justify-center p-[1vw] bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="bg-white rounded-[1.2vw] shadow-2xl border border-gray-100 w-full max-w-[32vw] overflow-hidden flex flex-col font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-[1.5vw] py-[1.2vw] border-b border-gray-100 bg-gradient-to-r from-orange-50/50 via-white to-white">
            <div className="flex items-center gap-[0.75vw]">
              <div className="w-[2.2vw] h-[2.2vw] rounded-[0.6vw] bg-[#ea543a]/10 text-[#ea543a] flex items-center justify-center">
                <Languages className="w-[1.2vw] h-[1.2vw]" />
              </div>
              <div>
                <h3 className="text-[1vw] font-bold text-gray-900 flex items-center gap-[0.4vw]">
                  Translate to Indian Language
                </h3>
                <p className="text-[0.7vw] text-gray-500">
                  Translates all pages and creates a new cloned flipbook
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-[0.3vw] rounded-[0.3vw] hover:bg-gray-100 transition-colors"
            >
              <X className="w-[1vw] h-[1vw]" />
            </button>
          </div>

          {/* Body */}
          <div className="p-[1.5vw] space-y-[1.2vw]">
            {/* Book Info Summary */}
            <div className="p-[0.8vw] bg-gray-50 rounded-[0.7vw] border border-gray-200/70 flex items-center justify-between">
              <div className="flex items-center gap-[0.6vw] min-w-0">
                <BookOpen className="w-[1vw] h-[1vw] text-gray-400 flex-shrink-0" />
                <span className="text-[0.78vw] font-semibold text-gray-800 truncate">
                  {originalTitle}
                </span>
              </div>
              {pageCount > 0 && (
                <span className="text-[0.68vw] font-medium text-gray-500 bg-white px-[0.5vw] py-[0.2vw] rounded-[0.35vw] border border-gray-200 flex-shrink-0">
                  {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                </span>
              )}
            </div>

            {/* Language Selectors */}
            <div className="grid grid-cols-2 gap-[1vw]">
              {/* Source Language (English Only) */}
              <div>
                <label className="block text-[0.72vw] font-bold text-gray-700 mb-[0.35vw]">
                  Source Language
                </label>
                <div className="w-full text-[0.78vw] bg-gray-100 border border-gray-200 rounded-[0.5vw] px-[0.8vw] py-[0.55vw] text-gray-700 font-semibold flex items-center justify-between cursor-not-allowed">
                  <span>English</span>
                  <span className="text-[0.62vw] text-gray-400 font-medium">Fixed</span>
                </div>
              </div>

              {/* Target Language */}
              <div>
                <label className="block text-[0.72vw] font-bold text-gray-700 mb-[0.35vw]">
                  Target Language
                </label>
                <select
                  value={tgtLang}
                  onChange={(e) => setTgtLang(e.target.value)}
                  className="w-full text-[0.78vw] bg-white border border-gray-300 rounded-[0.5vw] px-[0.8vw] py-[0.55vw] focus:outline-none focus:ring-2 focus:ring-[#ea543a]/30 focus:border-[#ea543a] text-gray-800 font-medium cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.filter(l => l.code !== 'eng_Latn').map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name} ({l.native})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* New Cloned Book Title */}
            <div>
              <label className="block text-[0.72vw] font-bold text-gray-700 mb-[0.35vw]">
                New Flipbook Title
              </label>
              <input
                type="text"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="Enter new flipbook name..."
                className="w-full text-[0.78vw] bg-white border border-gray-300 rounded-[0.5vw] px-[0.8vw] py-[0.55vw] focus:outline-none focus:ring-2 focus:ring-[#ea543a]/30 focus:border-[#ea543a] text-gray-800 font-medium"
              />
              <span className="text-[0.62vw] text-gray-400 mt-[0.2vw] block">
                The original book will remain untouched; a new translated book will be added to your library.
              </span>
            </div>

            {/* Feature Note */}
            <div className="p-[0.75vw] bg-orange-50/70 border border-orange-200/60 rounded-[0.6vw] flex items-start gap-[0.5vw]">
              <Sparkles className="w-[0.9vw] h-[0.9vw] text-[#ea543a] mt-[0.1vw] flex-shrink-0" />
              <p className="text-[0.66vw] text-orange-900 leading-relaxed">
                <strong>In-Place Neural Translation:</strong> Text will be translated directly within the SVG layers, keeping fonts, font sizes, colors, and layout coordinates perfectly intact.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-[0.75vw] px-[1.5vw] py-[1vw] border-t border-gray-100 bg-gray-50/70">
            <button
              onClick={onClose}
              className="px-[1vw] py-[0.55vw] text-[0.75vw] font-semibold text-gray-600 hover:text-gray-800 rounded-[0.5vw] hover:bg-gray-200/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              className="px-[1.3vw] py-[0.55vw] text-[0.75vw] font-semibold text-white bg-[#ea543a] hover:bg-[#d9482f] rounded-[0.5vw] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-[0.4vw]"
            >
              <span>Translate & Create Book</span>
              <ArrowRight className="w-[0.85vw] h-[0.85vw]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
