import React from 'react';
import { Icon } from '@iconify/react';

const MoveBookModal = ({
  isOpen,
  onClose,
  folders,
  targetMoveFolder,
  setTargetMoveFolder,
  newShelfName,
  setNewShelfName,
  openDropdown,
  setOpenDropdown,
  onMoveSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-[400px] max-w-[90vw] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Move to Folder</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2 cursor-pointer">
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Destination Folder</label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'move_folder' ? null : 'move_folder')}
              className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none cursor-pointer"
            >
              <span className="text-[#5B738B]">{targetMoveFolder === '__add_shelf__' ? '+ Add Shelf' : targetMoveFolder}</span>
              <Icon icon={openDropdown === 'move_folder' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 text-[#8BA3BA]" />
            </button>

            {openDropdown === 'move_folder' && (
              <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.08)] py-1 overflow-hidden">
                {folders.map(folder => (
                  <div
                    key={folder.name}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${targetMoveFolder === folder.name ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                    onClick={() => {
                      setTargetMoveFolder(folder.name);
                      setOpenDropdown(null);
                    }}
                  >
                    {folder.name}
                  </div>
                ))}
                <div
                  className={`px-4 py-2 text-sm cursor-pointer border-t border-gray-100 hover:bg-gray-50 transition-colors ${targetMoveFolder === '__add_shelf__' ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                  onClick={() => {
                    setTargetMoveFolder('__add_shelf__');
                    setOpenDropdown(null);
                  }}
                >
                  + Add Shelf
                </div>
              </div>
            )}
          </div>

          {targetMoveFolder === '__add_shelf__' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Folder Name</label>
              <input
                type="text"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter new folder name"
                autoFocus
              />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-5 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer">Cancel</button>
          <button
            onClick={onMoveSubmit}
            className="px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
          >
            {targetMoveFolder === '__add_shelf__' ? 'Create & Move' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveBookModal;

