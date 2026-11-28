import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Check, X, Minimize2, Maximize2, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TranslationTaskWidget({
  task,
  isMinimized,
  setIsMinimized,
  onDismiss
}) {
  const navigate = useNavigate();

  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const isFailed = task.status === 'failed';
  const percent = Math.min(100, Math.max(0, task.percent || 0));

  const handleOpenBook = () => {
    if (task.newBook && task.newBook.v_id) {
      const folder = task.newBook.folder_id || 'default';
      navigate(`/editor/customized_editor/${encodeURIComponent(folder)}/${task.newBook.v_id}`);
      if (onDismiss) onDismiss();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="fixed bottom-[1.5vw] right-[1.5vw] z-[99999] bg-white rounded-[1vw] shadow-2xl border border-gray-200/80 overflow-hidden font-sans"
        style={{ width: isMinimized ? '20vw' : '26vw' }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-[1vw] py-[0.75vw] bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-[0.5vw] min-w-0">
            <div className={`w-[1.6vw] h-[1.6vw] rounded-[0.4vw] flex items-center justify-center flex-shrink-0 ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-600'
                : isFailed
                ? 'bg-red-100 text-red-600'
                : 'bg-orange-100 text-[#ea543a]'
            }`}>
              {isCompleted ? (
                <Check className="w-[0.9vw] h-[0.9vw]" strokeWidth={2.5} />
              ) : isFailed ? (
                <X className="w-[0.9vw] h-[0.9vw]" strokeWidth={2.5} />
              ) : (
                <Languages className="w-[0.9vw] h-[0.9vw]" strokeWidth={2} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[0.75vw] font-bold text-gray-800 truncate">
                {isCompleted ? 'Translation Completed' : isFailed ? 'Translation Failed' : 'Translating Book'}
              </span>
              <span className="text-[0.62vw] text-gray-500 truncate">
                {task.tgtName ? `Target: ${task.tgtName}` : 'Book Translation'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-[0.35vw] flex-shrink-0">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-[0.3vw] text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-[0.3vw] transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-[0.85vw] h-[0.85vw]" />
              ) : (
                <Minimize2 className="w-[0.85vw] h-[0.85vw]" />
              )}
            </button>
            <button
              onClick={onDismiss}
              className="p-[0.3vw] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-[0.3vw] transition-colors"
              title="Close"
            >
              <X className="w-[0.85vw] h-[0.85vw]" />
            </button>
          </div>
        </div>

        {/* Minimized Content Pill */}
        {isMinimized ? (
          <div className="px-[1vw] py-[0.6vw] flex items-center justify-between gap-[0.75vw]">
            <div className="flex items-center gap-[0.5vw] min-w-0">
              {!isCompleted && !isFailed && (
                <Loader2 className="w-[0.9vw] h-[0.9vw] text-[#ea543a] animate-spin flex-shrink-0" />
              )}
              <span className="text-[0.7vw] font-medium text-gray-700 truncate">
                {task.newBookName || 'Translated Flipbook'}
              </span>
            </div>
            {isCompleted ? (
              <button
                onClick={handleOpenBook}
                className="px-[0.6vw] py-[0.25vw] bg-emerald-600 hover:bg-emerald-700 text-white text-[0.65vw] font-semibold rounded-[0.35vw] transition-colors flex items-center gap-[0.25vw] flex-shrink-0"
              >
                Open
              </button>
            ) : (
              <span className="text-[0.7vw] font-bold text-[#ea543a] flex-shrink-0">
                {percent}%
              </span>
            )}
          </div>
        ) : (
          /* Expanded Content Card */
          <div className="p-[1vw] space-y-[0.75vw]">
            <div>
              <p className="text-[0.75vw] font-semibold text-gray-800 truncate mb-[0.15vw]">
                {task.newBookName || task.sourceBookName}
              </p>
              <p className="text-[0.65vw] text-gray-500">
                {isCompleted
                  ? `All ${task.total || ''} pages successfully translated into ${task.tgtName || 'Indian Language'}`
                  : isFailed
                  ? (task.error || 'Translation encountered an issue')
                  : `Translating page ${task.current || 0} of ${task.total || 0}...`}
              </p>
            </div>

            {/* Progress Track */}
            {!isCompleted && !isFailed && (
              <div className="space-y-[0.35vw]">
                <div className="w-full bg-gray-100 rounded-full h-[0.4vw] overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#ea543a] to-[#ff735c] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[0.62vw] text-gray-500 font-medium">
                  <span>Progress</span>
                  <span className="text-[#ea543a] font-bold">{percent}%</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {isCompleted && (
              <div className="flex items-center gap-[0.5vw] pt-[0.25vw]">
                <button
                  onClick={handleOpenBook}
                  className="flex-1 py-[0.5vw] bg-[#ea543a] hover:bg-[#d9482f] text-white text-[0.75vw] font-semibold rounded-[0.4vw] shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-[0.4vw] active:scale-95"
                >
                  <span>Open Translated Book</span>
                  <ExternalLink className="w-[0.8vw] h-[0.8vw]" />
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
