import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Folder, ArrowDownUp, Trash2, RotateCcw, ChevronDown, Check, Minus, Lock, Globe } from 'lucide-react';
import { Icon } from '@iconify/react';
import CustomScrollbar from '../CustomScrollbar';
import FlipbookCard from './FlipbookCard';
import LazyPreview from './LazyPreview';
import { getAssetBaseUrl } from '../../utils/assetUtils';

export default function TrashScreen({
    navigate,
    trashedBooks = [],
    onEmptyTrash,
    onRestoreBook,
    onDeleteBook,
    onBulkRestore,
    onBulkDelete,
    user,
    emailId,
    backendUrl = import.meta.env.VITE_BACKEND_URL || '',
    books = []
}) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [sortOption, setSortOption] = useState('Recently Created');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    const statusDropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
                setIsStatusOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDisplayDate = (dateVal) => {
        if (!dateVal) return '';
        if (typeof dateVal === 'string' && dateVal.includes('-') && dateVal.includes(' ')) {
            const parts = dateVal.split(' ')[0].split('-');
            if (parts.length === 3 && parts[2].length === 4) return dateVal;
        }

        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return String(dateVal);

        const pad = (n) => n.toString().padStart(2, '0');
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear();

        let hours = d.getHours();
        const minutes = pad(d.getMinutes());
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        return `${day}-${month}-${year} ${pad(hours)}:${minutes} ${ampm}`;
    };

    const formatDisplaySize = (book) => {
        const bytes = book?.fileSize || book?.sizeBytes || 0;
        if (bytes > 0) {
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
        }
        if (book?.size) return book.size;
        return '0 B';
    };

    const getVisibilityType = (book) => {
        const raw = String(
            book.Visibility?.access ||
            book.Visibility?.type ||
            book.Customized_Settings?.Visibility?.access ||
            book.Customized_Settings?.Visibility?.type ||
            book.settings?.Visibility?.access ||
            book.settings?.Visibility?.type ||
            book.share?.access ||
            book.share?.type ||
            book.access ||
            (book.isPublic === false ? 'private' : 'public')
        ).toLowerCase().trim();

        if (raw.includes('password') || raw.includes('protect')) return 'password';
        if (raw.includes('invite') || raw.includes('email')) return 'invite';
        if (raw.includes('private') || book.isPublic === false) return 'private';
        return 'public';
    };

    const renderStatusBadge = (book) => {
        const visType = getVisibilityType(book);
        if (visType === 'password') {
            return (
                <span className="flex items-center gap-[0.25vw] px-[0.5vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                    <Icon icon="lucide:key-round" className="w-[0.6vw] h-[0.6vw]" />
                    <span>Password</span>
                </span>
            );
        }
        if (visType === 'invite') {
            return (
                <span className="flex items-center gap-[0.25vw] px-[0.5vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                    <Icon icon="lucide:user-check" className="w-[0.6vw] h-[0.6vw]" />
                    <span>Invite</span>
                </span>
            );
        }
        if (visType === 'private') {
            return (
                <span className="flex items-center gap-[0.25vw] px-[0.55vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-gray-100 text-gray-600">
                    <Lock size="0.6vw" />
                    <span>Private</span>
                </span>
            );
        }
        return (
            <span className="flex items-center gap-[0.25vw] px-[0.55vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-[#e8f7ee] text-[#16a34a]">
                <Globe size="0.6vw" />
                <span>Public</span>
            </span>
        );
    };

    const filteredBooks = useMemo(() => {
        return (trashedBooks || [])
            .filter((book) => {
                const title = (book.title || book.realName || book.flipbookName || '').toLowerCase();
                const query = searchQuery.trim().toLowerCase();
                if (query && !title.includes(query)) return false;

                if (statusFilter !== 'All Status') {
                    const vis = getVisibilityType(book);
                    if (statusFilter === 'Public' && vis !== 'public') return false;
                    if (statusFilter === 'Private' && vis !== 'private') return false;
                    if (statusFilter === 'Protected' && vis !== 'password') return false;
                    if (statusFilter === 'Email' && vis !== 'invite') return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortOption === 'Recently Created') {
                    return new Date(b.createdAt || b.created || 0) - new Date(a.createdAt || a.created || 0);
                }
                if (sortOption === 'Recently Modified') {
                    return new Date(b.updatedAt || b.lastUpdated || b.mtime || b.createdAt || 0) - new Date(a.updatedAt || a.lastUpdated || a.mtime || a.createdAt || 0);
                }
                if (sortOption === 'Alphabetical (A-Z)' || sortOption === 'Name (A → Z)') {
                    return (a.title || a.realName || '').localeCompare(b.title || b.realName || '');
                }
                if (sortOption === 'Alphabetical (Z-A)' || sortOption === 'Name (Z → A)') {
                    return (b.title || b.realName || '').localeCompare(a.title || a.realName || '');
                }
                if (sortOption === 'Most Viewed') {
                    return (b.viewsCount || b.views || 0) - (a.viewsCount || a.views || 0);
                }
                return 0;
            });
    }, [trashedBooks, searchQuery, statusFilter, sortOption]);

    const getBookKey = (b) => b.id || b._id || b.v_id;

    const isAllSelected = filteredBooks.length > 0 && filteredBooks.every((b) => selectedIds.includes(getBookKey(b)));
    const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

    const toggleCardSelection = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleMultipleSelectionToggle = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredBooks.map((b) => getBookKey(b)));
        }
    };

    const handleBulkRestoreClick = () => {
        if (selectedIds.length === 0) return;
        if (onBulkRestore) onBulkRestore(selectedIds);
        setSelectedIds([]);
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) return;
        if (onBulkDelete) onBulkDelete(selectedIds);
        setSelectedIds([]);
    };

    return (
        <div className="flex flex-col w-full h-full px-[0.5vw] pb-0 pt-[0.2vw] overflow-visible font-sans text-gray-800">
            {/* Page Header */}
            <h2 className="text-[1.15vw] font-bold text-[#1f2937] mb-[0.6vw]">Trash</h2>

            {/* Toolbar Row */}
            <div className="w-full mb-[0.8vw] relative z-20 flex-shrink-0">
                <div className="flex items-center justify-between w-full">
                    {/* Left Controls: Search, Folder, Status, Sort */}
                    <div className="flex items-center gap-[0.55vw] flex-shrink-0">
                        {/* Search Input */}
                        <div className="relative w-[12.5vw] flex-shrink-0">
                            <Search className="absolute left-[0.9vw] top-1/2 -translate-y-1/2 text-[#ec5137]" size="0.95vw" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-[2.4vw] pr-[1vw] py-[0.5vw] rounded-[0.6vw] border border-gray-200 text-[0.84vw] focus:outline-none focus:ring-1 focus:ring-[#ec5137] bg-white text-gray-700 placeholder-gray-400 shadow-sm whitespace-nowrap"
                            />
                        </div>

                        {/* Folder Dropdown (Locked to Trash) */}
                        <div className="relative flex-shrink-0">
                            <button
                                type="button"
                                className="flex items-center gap-[0.45vw] px-[0.85vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer whitespace-nowrap flex-shrink-0"
                            >
                                <Folder size="0.9vw" className="text-[#ec5137] flex-shrink-0" />
                                <span className="whitespace-nowrap">Trash</span>
                                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.2vw] flex-shrink-0" />
                            </button>
                        </div>

                        {/* Status Dropdown */}
                        <div className="relative flex-shrink-0" ref={statusDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsStatusOpen(!isStatusOpen);
                                    setIsSortOpen(false);
                                }}
                                className="flex items-center gap-[0.45vw] px-[0.85vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer whitespace-nowrap flex-shrink-0"
                            >
                                <Icon icon="lucide:disc" className="w-[0.9vw] h-[0.9vw] text-[#ec5137] flex-shrink-0" />
                                <span className="whitespace-nowrap">{statusFilter}</span>
                                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.2vw] flex-shrink-0" />
                            </button>

                            {isStatusOpen && (
                                <div className="absolute top-full left-0 mt-[0.25vw] min-w-[9vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 overflow-hidden">
                                    {['All Status', 'Public', 'Private', 'Protected', 'Email'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setStatusFilter(opt);
                                                setIsStatusOpen(false);
                                            }}
                                            className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] whitespace-nowrap ${
                                                statusFilter === opt
                                                    ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                                                    : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative flex-shrink-0" ref={sortDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSortOpen(!isSortOpen);
                                    setIsStatusOpen(false);
                                }}
                                className="flex items-center gap-[0.45vw] px-[0.85vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer whitespace-nowrap flex-shrink-0"
                            >
                                <ArrowDownUp size="0.9vw" className="text-[#ec5137] flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                    Sort by - <span className="text-gray-500 font-normal">{sortOption}</span>
                                </span>
                                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.2vw] flex-shrink-0" />
                            </button>

                            {isSortOpen && (
                                <div className="absolute top-full left-0 mt-[0.25vw] min-w-[14vw] max-h-[22vw] overflow-y-auto overflow-x-hidden custom-scrollbar bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50">
                                    {[
                                        'Recently Created',
                                        'Recently Modified',
                                        'Name (A → Z)',
                                        'Name (Z → A)',
                                        'Most Viewed'
                                    ].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setSortOption(opt);
                                                setIsSortOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] whitespace-nowrap ${
                                                sortOption === opt
                                                    ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                                                    : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                                            }`}
                                        >
                                            <span className="whitespace-nowrap">{opt}</span>
                                            {sortOption === opt && <Check size="0.75vw" className="text-[#ec5137]" strokeWidth={2.5} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Controls: Empty Trash & Multiple Selection */}
                    <div className="flex items-center gap-[0.6vw] flex-shrink-0">
                        {/* Empty Trash Button (when no selection) */}
                        {selectedIds.length === 0 && filteredBooks.length > 0 && (
                            <button
                                type="button"
                                onClick={onEmptyTrash}
                                className="flex items-center gap-[0.4vw] px-[0.75vw] py-[0.45vw] bg-white text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-[0.5vw] transition-all shadow-sm text-[0.75vw] font-semibold cursor-pointer whitespace-nowrap flex-shrink-0"
                            >
                                <Trash2 size="0.85vw" className="text-red-500 flex-shrink-0" />
                                <span className="whitespace-nowrap">Empty Trash</span>
                            </button>
                        )}

                        {/* Bulk Action Buttons (when items selected) */}
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-[0.45vw] flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={handleBulkRestoreClick}
                                    className="flex items-center gap-[0.4vw] px-[0.75vw] py-[0.45vw] bg-blue-600 text-white rounded-[0.5vw] hover:bg-blue-700 transition-colors shadow-sm text-[0.75vw] font-semibold cursor-pointer whitespace-nowrap flex-shrink-0"
                                >
                                    <RotateCcw size="0.85vw" className="flex-shrink-0" />
                                    <span className="whitespace-nowrap">Restore ({selectedIds.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkDeleteClick}
                                    className="flex items-center gap-[0.4vw] px-[0.75vw] py-[0.45vw] bg-white text-red-500 border border-red-200 rounded-[0.5vw] hover:bg-red-50 transition-colors shadow-sm text-[0.75vw] font-semibold cursor-pointer whitespace-nowrap flex-shrink-0"
                                >
                                    <Trash2 size="0.85vw" className="flex-shrink-0" />
                                    <span className="whitespace-nowrap">Delete Permanently ({selectedIds.length})</span>
                                </button>
                            </div>
                        )}

                        {/* Multiple Selection Checkbox */}
                        <label
                            onClick={handleMultipleSelectionToggle}
                            className="flex items-center gap-[0.45vw] cursor-pointer select-none whitespace-nowrap flex-shrink-0"
                        >
                            <div
                                className={`w-[1.1vw] h-[1.1vw] rounded-[0.2vw] border flex items-center justify-center transition-all flex-shrink-0 ${
                                    isAllSelected || isSomeSelected
                                        ? 'bg-gray-700 border-gray-700 text-white'
                                        : 'border-gray-400 bg-white'
                                }`}
                            >
                                {isAllSelected && <Check size="0.75vw" className="text-white" strokeWidth={3} />}
                                {isSomeSelected && <Minus size="0.75vw" className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-[0.84vw] font-medium text-gray-600 whitespace-nowrap">Multiple Selection</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Trashed Books List */}
            {filteredBooks.length > 0 ? (
                <CustomScrollbar
                    color="#d1d5db"
                    hoverColor="#9ca3af"
                    width="0.35vw"
                    className="flex-1 pr-[0.3vw] pb-[2vw] z-10 space-y-[0.85vw] min-h-0"
                >
                    {filteredBooks.map((book) => (
                        <FlipbookCard
                            key={getBookKey(book)}
                            book={book}
                            variant="trash"
                            selectedIds={selectedIds}
                            toggleCardSelection={toggleCardSelection}
                            activeFolder="Trash"
                            emailId={emailId}
                            backendUrl={backendUrl}
                            formatDisplayDate={formatDisplayDate}
                            formatDisplaySize={formatDisplaySize}
                            renderStatusBadge={renderStatusBadge}
                            onRestoreBook={onRestoreBook}
                            onDeleteBook={onDeleteBook}
                            navigate={navigate}
                            books={books}
                        />
                    ))}
                </CustomScrollbar>
            ) : (
                /* Empty Trash State */
                <div className="flex-1 flex flex-col items-center justify-center py-[5vw] text-center">
                    <div className="w-[4.5vw] h-[4.5vw] rounded-full bg-red-50 flex items-center justify-center mb-[1vw] text-red-400 shadow-sm border border-red-100">
                        <Trash2 size="2.2vw" />
                    </div>
                    <h3 className="text-[1.1vw] font-bold text-gray-800 mb-[0.3vw]">Trash is empty</h3>
                    <p className="text-[0.82vw] text-gray-400 max-w-[20vw]">
                        Deleted flipbooks will appear here. You can restore them or permanently delete them at any time.
                    </p>
                </div>
            )}
        </div>
    );
}
