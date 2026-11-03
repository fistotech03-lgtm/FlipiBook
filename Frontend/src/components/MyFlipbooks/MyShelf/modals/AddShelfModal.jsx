import React from 'react';
import { Icon } from '@iconify/react';

const AddShelfModal = ({
  isOpen,
  onClose,
  newShelfName,
  setNewShelfName,
  onAddShelf
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-[400px] max-w-[90vw] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Create New Shelf</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2 cursor-pointer">
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Shelf Name</label>
          <input
            type="text"
            value={newShelfName}
            onChange={(e) => setNewShelfName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAddShelf();
              if (e.key === 'Escape') onClose();
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter shelf name"
            autoFocus
          />
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-5 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer">Cancel</button>
          <button
            onClick={onAddShelf}
            className="px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddShelfModal;

