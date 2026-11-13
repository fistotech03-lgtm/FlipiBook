import React, { useState } from 'react';
import { X, BookOpen, Check, Search, Plus } from 'lucide-react';

export default function AddToFlipbookModal({
  isOpen,
  onClose,
  model,
  flipbooks = [],
  onConfirm
}) {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !model) return null;

  const filteredBooks = flipbooks.filter((b) => {
    const title = (b.title || b.flipbookName || b.name || '').toLowerCase();
    return title.includes(search.toLowerCase());
  });

  const handleConfirm = async () => {
    if (!selectedBookId) return;
    setIsSubmitting(true);
    try {
      if (onConfirm) {
        await onConfirm(selectedBookId, model);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1vw] bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-[1vw] w-[34vw] max-w-[90vw] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.2vw] py-[0.8vw] border-b border-gray-100">
          <div>
            <h3 className="text-[1vw] font-bold text-gray-900">Add 3D Model to Flipbook</h3>
            <p className="text-[0.72vw] text-gray-500 mt-[0.1vw]">
              Select a target flipbook to embed <strong className="text-gray-800">{model.title || model.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size="1vw" />
          </button>
        </div>

        {/* Search */}
        <div className="p-[0.9vw] border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-[0.7vw] top-1/2 -translate-y-1/2 text-gray-400" size="0.85vw" />
            <input
              type="text"
              placeholder="Search your flipbooks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-[2vw] pr-[0.8vw] py-[0.45vw] bg-white border border-gray-200 rounded-[0.5vw] text-[0.78vw] focus:outline-none focus:border-[#ec5137] text-gray-700"
            />
          </div>
        </div>

        {/* List of flipbooks */}
        <div className="max-h-[18vw] overflow-y-auto p-[0.9vw] space-y-[0.4vw]">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-[2vw] text-gray-400 text-[0.8vw]">
              No flipbooks found.
            </div>
          ) : (
            filteredBooks.map((book) => {
              const bookId = book.v_id || book.id;
              const isSelected = selectedBookId === bookId;
              const title = book.title || book.flipbookName || book.name || 'Untitled Flipbook';
              const pages = book.pageCount || book.totalPages || book.pages?.length || 0;

              return (
                <div
                  key={bookId}
                  onClick={() => setSelectedBookId(bookId)}
                  className={`flex items-center justify-between p-[0.6vw] rounded-[0.6vw] border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#ec5137] bg-[#fff5f3] shadow-xs'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-[0.7vw] min-w-0">
                    <div className={`w-[2.2vw] h-[2.2vw] rounded-[0.4vw] flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#ec5137] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <BookOpen size="1.1vw" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.8vw] font-bold text-gray-800 truncate">{title}</p>
                      <p className="text-[0.65vw] text-gray-400 font-medium">{pages ? `${pages} Pages` : 'Flipbook Document'}</p>
                    </div>
                  </div>
                  <div className={`w-[1.2vw] h-[1.2vw] rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[#ec5137] bg-[#ec5137] text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check size="0.75vw" strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[0.55vw] px-[1.2vw] py-[0.8vw] border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-[0.9vw] py-[0.4vw] text-[0.78vw] font-semibold text-gray-600 hover:bg-gray-200/60 rounded-[0.4vw] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedBookId || isSubmitting}
            className="px-[1.2vw] py-[0.45vw] bg-[#ec5137] hover:bg-[#d4432c] disabled:opacity-50 text-white text-[0.78vw] font-semibold rounded-[0.4vw] shadow-sm transition-all cursor-pointer flex items-center gap-[0.35vw]"
          >
            <Plus size="0.85vw" strokeWidth={2.5} />
            <span>{isSubmitting ? 'Adding...' : 'Add to Flipbook'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

