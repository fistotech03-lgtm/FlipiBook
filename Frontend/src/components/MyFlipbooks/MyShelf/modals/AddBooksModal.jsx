import React from 'react';
import { Icon } from '@iconify/react';
import { covers } from '../constants';

const AddBooksModal = ({
  isOpen,
  onClose,
  selectedFolder,
  folders,
  allCreatedBooks = [],
  selectedBookIdsToAdd,
  setSelectedBookIdsToAdd,
  addBookSearch,
  setAddBookSearch,
  isAddingBooks,
  onAddBooksToShelf,
}) => {
  if (!isOpen) return null;

  const currentFolderBooks = folders.find(f => f.name === selectedFolder)?.books || [];
  const currentFolderBookIds = new Set(currentFolderBooks.map(b => b.v_id));

  // Available created books (all created books that are not already on this shelf)
  const availableBooks = allCreatedBooks.filter(b => {
    if (currentFolderBookIds.has(b.v_id)) return false;
    if (!addBookSearch.trim()) return true;
    const query = addBookSearch.toLowerCase();
    const title = (b.flipbookName || b.title || '').toLowerCase();
    return title.includes(query);
  });

  const toggleSelectBook = (v_id) => {
    setSelectedBookIdsToAdd(prev =>
      prev.includes(v_id) ? prev.filter(id => id !== v_id) : [...prev, v_id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookIdsToAdd.length === availableBooks.length) {
      setSelectedBookIdsToAdd([]);
    } else {
      setSelectedBookIdsToAdd(availableBooks.map(b => b.v_id));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[720px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5733] flex items-center justify-center">
              <Icon icon="mdi:book-plus-outline" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Books to Shelf</h2>
              <p className="text-xs text-gray-500">
                Select books to place on <span className="font-semibold text-gray-700">{selectedFolder}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Action Bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
          <div className="relative flex-1">
            <Icon icon="lucide:search" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={addBookSearch}
              onChange={(e) => setAddBookSearch(e.target.value)}
              placeholder="Search your created books..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF5733] focus:ring-1 focus:ring-[#FF5733] transition-all"
            />
            {addBookSearch && (
              <button
                onClick={() => setAddBookSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon icon="mdi:close-circle" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {availableBooks.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-semibold text-[#FF5733] hover:text-[#e04523] px-2.5 py-1.5 rounded-lg hover:bg-orange-50/60 transition-colors shrink-0"
            >
              {selectedBookIdsToAdd.length === availableBooks.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {/* Body: Grid of Books */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[260px] max-h-[50vh]">
          {availableBooks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-500">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                <Icon icon="mdi:book-check-outline" className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {allCreatedBooks.length === 0
                  ? "You haven't created any flipbooks yet."
                  : addBookSearch
                    ? 'No books matching your search.'
                    : 'All of your created books are already on this shelf!'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {allCreatedBooks.length === 0
                  ? 'Create a flipbook first to add it to your shelf.'
                  : 'You can remove existing books or select another shelf.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableBooks.map((b, idx) => {
                const isSelected = selectedBookIdsToAdd.includes(b.v_id);
                const title = b.flipbookName || b.title || `Book ${idx + 1}`;
                const cover = b.image || covers[idx % covers.length];
                const pages = typeof b.pages === 'number' ? b.pages : (b.pages?.length || 0);

                return (
                  <div
                    key={b.v_id || idx}
                    onClick={() => toggleSelectBook(b.v_id)}
                    className={`relative group rounded-xl border-2 cursor-pointer transition-all duration-150 overflow-hidden flex flex-col bg-white ${
                      isSelected
                        ? 'border-[#FF5733] ring-2 ring-orange-200/80 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Selection Checkbox Badge */}
                    <div
                      className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#FF5733] text-white shadow-sm' : 'bg-black/35 text-transparent group-hover:text-white/60'
                      }`}
                    >
                      <Icon icon="mdi:check" className="w-3.5 h-3.5" />
                    </div>

                    {/* Cover Image */}
                    <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden relative">
                      <img
                        src={cover}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-2.5 flex flex-col justify-between flex-1 bg-white">
                      <p className="text-xs font-semibold text-gray-800 truncate" title={title}>
                        {title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {pages} {pages === 1 ? 'Page' : 'Pages'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-xs text-gray-500">
            {selectedBookIdsToAdd.length > 0 ? (
              <span className="font-semibold text-gray-800">
                {selectedBookIdsToAdd.length} {selectedBookIdsToAdd.length === 1 ? 'book' : 'books'} selected
              </span>
            ) : (
              'Select books to add'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={selectedBookIdsToAdd.length === 0 || isAddingBooks}
              onClick={onAddBooksToShelf}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#FF5733] text-white hover:bg-[#e04523] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5"
            >
              {isAddingBooks ? (
                <>
                  <Icon icon="eos-icons:loading" className="w-3.5 h-3.5" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:plus" className="w-3.5 h-3.5" />
                  <span>Add to Shelf</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBooksModal;

