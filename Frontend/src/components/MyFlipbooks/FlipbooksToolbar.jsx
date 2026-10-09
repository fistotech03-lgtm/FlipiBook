import React from 'react';
import { Search, Folder, ChevronDown, ArrowDownUp, Trash2, RotateCcw, FolderInput, Check } from 'lucide-react';
import { Icon } from '@iconify/react';

export default function FlipbooksToolbar({
    activeFolder,
    setActiveFolder,
    searchQuery,
    setSearchQuery,
    folders,
    isFolderDropdownOpen,
    setIsFolderDropdownOpen,
    folderDropdownRef,
    statusFilter,
    setStatusFilter,
    isStatusDropdownOpen,
    setIsStatusDropdownOpen,
    statusDropdownRef,
    sortCategories,
    sortOption,
    setSortOption,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    sortDropdownRef,
    filteredBooks,
    selectedBooks,
    handleEmptyTrashClick,
    handleBulkRestore,
    handleBulkPermanentDelete,
    handleBulkDelete,
    handleBulkMove,
    isAllSelected,
    handleSelectAll
}) {
    return (
        <div className="w-full mb-[0.8vw] relative z-20 flex-shrink-0">
            <h2 className="text-[1.15vw] font-bold text-[#1f2937] mb-[0.6vw]">
                {activeFolder === 'All Flipbook' || activeFolder === 'All' || !activeFolder ? 'All Flipbooks' : (activeFolder === 'Recent Book' ? 'Recent' : activeFolder)}
            </h2>

            <div className="flex items-center justify-between w-full">
                {/* Left: Search & Filter Dropdowns */}
                <div className="flex items-center gap-[0.75vw]">
                    {/* Search Input */}
                    <div className="relative w-[15vw]">
                        <Search className="absolute left-[0.9vw] top-1/2 -translate-y-1/2 text-[#ec5137]" size="0.95vw" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-[2.4vw] pr-[1vw] py-[0.5vw] rounded-[0.6vw] border border-gray-200 text-[0.84vw] focus:outline-none focus:ring-1 focus:ring-[#ec5137] bg-white text-gray-700 placeholder-gray-400 shadow-sm"
                        />
                    </div>

                    {/* All Folders Dropdown */}
                    <div className="relative" ref={folderDropdownRef}>
                        <button
                            onClick={() => { setIsFolderDropdownOpen(!isFolderDropdownOpen); setIsStatusDropdownOpen(false); setIsSortDropdownOpen(false); }}
                            className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer"
                        >
                            <Folder size="0.9vw" className="text-[#ec5137]" />
                            <span>{activeFolder === 'All Flipbook' || activeFolder === 'All' ? 'All Folders' : activeFolder}</span>
                            <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
                        </button>
                        {isFolderDropdownOpen && (
                            <div className="absolute top-full left-0 mt-[0.25vw] min-w-[10vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 max-h-[14vw] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                <button
                                    onClick={() => { setActiveFolder('All Flipbook'); setIsFolderDropdownOpen(false); }}
                                    className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] ${
                                        activeFolder === 'All Flipbook' || activeFolder === 'All'
                                            ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                                            : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                                    }`}
                                >
                                    All Folders
                                </button>
                                {folders.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => { setActiveFolder(f.name); setIsFolderDropdownOpen(false); }}
                                        className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors truncate cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] ${
                                            activeFolder === f.name
                                                ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                                                : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                                        }`}
                                    >
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* All Status Dropdown */}
                    <div className="relative" ref={statusDropdownRef}>
                        <button
                            onClick={() => { setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsSortDropdownOpen(false); setIsFolderDropdownOpen(false); }}
                            className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer"
                        >
                            <Icon icon="lucide:disc" className="w-[0.9vw] h-[0.9vw] text-[#ec5137]" />
                            <span>{statusFilter}</span>
                            <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
                        </button>
                        {isStatusDropdownOpen && (
                            <div className="absolute top-full left-0 mt-[0.25vw] min-w-[9vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 overflow-hidden">
                                {['All Status', 'Public', 'Private', 'Protected', 'Email'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => { setStatusFilter(status); setIsStatusDropdownOpen(false); }}
                                        className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] ${
                                            statusFilter === status
                                                ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                                                : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort by Dropdown */}
                    <div className="relative" ref={sortDropdownRef}>
                        <button
                            onClick={() => { setIsSortDropdownOpen(!isSortDropdownOpen); setIsStatusDropdownOpen(false); setIsFolderDropdownOpen(false); }}
                            className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer"
                        >
                            <ArrowDownUp size="0.9vw" className="text-[#ec5137]" />
                            <span>Sort by - <span className="text-gray-500 font-normal">{sortOption}</span></span>
                            <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
                        </button>
                        {isSortDropdownOpen && (
                            <div className="absolute top-full left-0 mt-[0.25vw] min-w-[14vw] max-h-[22vw] overflow-y-auto overflow-x-hidden custom-scrollbar bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50">
                                {sortCategories && sortCategories.length > 0 ? (
                                    sortCategories.map((cat, idx) => (
                                        <div key={cat.id || idx} className={idx > 0 ? "border-t border-gray-100 pt-[0.2vw] mt-[0.2vw]" : ""}>
                                            <div className="px-[0.9vw] py-[0.25vw] text-[0.65vw] font-bold uppercase tracking-wider text-gray-400">
                                                {cat.title}
                                            </div>
                                            {cat.options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => { setSortOption(opt); setIsSortDropdownOpen(false); }}
                                                    className={`w-full flex items-center justify-between text-left px-[1vw] py-[0.45vw] text-[0.8vw] transition-colors cursor-pointer ${
                                                        sortOption === opt
                                                            ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                                                            : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                                                    }`}
                                                >
                                                    <span>{opt}</span>
                                                    {sortOption === opt && <Check size="0.75vw" className="text-[#ec5137]" strokeWidth={2.5} />}
                                                </button>
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    ['Recently Created', 'Recently Modified', 'Name (A → Z)', 'Name (Z → A)', 'Most Viewed'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => { setSortOption(opt); setIsSortDropdownOpen(false); }}
                                            className={`w-full flex items-center justify-between text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] ${
                                                sortOption === opt
                                                    ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                                                    : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                                            }`}
                                        >
                                            <span>{opt}</span>
                                            {sortOption === opt && <Check size="0.75vw" className="text-[#ec5137]" strokeWidth={2.5} />}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Selected Actions & Multiple Selection */}
                <div className="flex items-center gap-[1vw]">
                    {/* Empty Trash button when in Trash and no books selected */}
                    {activeFolder === 'Trash' && selectedBooks.length === 0 && filteredBooks.length > 0 && (
                        <button
                            onClick={handleEmptyTrashClick}
                            className="flex items-center gap-[0.35vw] px-[0.75vw] py-[0.4vw] bg-white text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-[0.5vw] transition-all shadow-sm text-[0.75vw] font-semibold cursor-pointer"
                        >
                            <Trash2 size="0.85vw" /> Empty Trash
                        </button>
                    )}

                    {selectedBooks.length > 0 && (
                        <div className="flex items-center gap-[0.5vw]">
                            {activeFolder === 'Trash' ? (
                                <>
                                    <button
                                        onClick={handleBulkRestore}
                                        className="flex items-center gap-[0.4vw] px-[0.75vw] py-[0.4vw] bg-blue-600 text-white rounded-[0.5vw] hover:bg-blue-700 transition-colors shadow-sm text-[0.75vw] font-semibold cursor-pointer"
                                    >
                                        <RotateCcw size="0.9vw" /> Restore ({selectedBooks.length})
                                    </button>
                                    <button
                                        onClick={handleBulkPermanentDelete}
                                        className="flex items-center gap-[0.4vw] px-[0.75vw] py-[0.4vw] bg-white text-red-500 border border-red-200 rounded-[0.5vw] hover:bg-red-50 transition-colors shadow-sm text-[0.75vw] font-semibold cursor-pointer"
                                    >
                                        <Trash2 size="0.9vw" /> Delete Permanently ({selectedBooks.length})
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.4vw] bg-white text-red-500 border border-red-200 rounded-[0.5vw] hover:bg-red-50 transition-colors shadow-sm text-[0.75vw] font-semibold cursor-pointer"
                                    >
                                        <Trash2 size="0.9vw" /> {(activeFolder === 'Recent Book' || activeFolder === 'Recent') ? 'Remove' : 'Move to trash'}
                                    </button>
                                    {activeFolder !== 'Recent Book' && activeFolder !== 'Recent' && (
                                        <button
                                            onClick={handleBulkMove}
                                            className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.4vw] bg-[#ec5137] text-white rounded-[0.5vw] hover:bg-[#d4432a] transition-colors shadow-sm text-[0.75vw] font-semibold cursor-pointer"
                                        >
                                            <FolderInput size="0.9vw" /> Move
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Checkbox for multiple selection */}
                    <label className="flex items-center gap-[0.5vw] cursor-pointer select-none" onClick={(e) => { e.preventDefault(); handleSelectAll(); }}>
                        <div className={`w-[1.1vw] h-[1.1vw] rounded-[0.2vw] border flex items-center justify-center transition-all ${isAllSelected ? 'bg-gray-700 border-gray-700' : 'border-gray-400 bg-white'}`}>
                            {isAllSelected && <Check size="0.75vw" className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[0.85vw] font-medium text-gray-600">Multiple Selection</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
