import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Search,
    Folder,
    ArrowDownUp,
    ChevronDown,
    Check,
    Lock,
    Globe,
    Heart,
    Eye,
    Wrench,
    PenTool,
    BarChart2,
    Share2,
    Download,
    MoreVertical,
    Trash2,
    Edit2,
    Plus,
    Minus
} from 'lucide-react';
import { Icon } from '@iconify/react';
import CustomScrollbar from '../CustomScrollbar';
import FlipbookCard from './FlipbookCard';
import LazyPreview from './LazyPreview';
import { getAssetBaseUrl } from '../../utils/assetUtils';

export default function FavoritesScreen({
    navigate,
    favoriteBooks = [],
    books = [],
    folders = [],
    user,
    emailId,
    backendUrl = import.meta.env.VITE_BACKEND_URL || '',
    onToggleFavorite,
    onShareClick,
    onDownloadClick,
    onTrashBook,
    onRenameBook,
    editingBookId,
    tempBookTitle,
    setTempBookTitle,
    saveBookEdit,
    handleBookKeyDown,
    formatDisplayDate: propFormatDate,
    formatDisplaySize: propFormatSize,
    onBulkTrash,
    activeBookMenu,
    setActiveBookMenu,
    menuPosition,
    setMenuPosition
}) {
    const [localMenuPosition, setLocalMenuPosition] = useState({ top: 0, left: 0, isDropup: false });
    // If favoriteBooks wasn't directly passed, derive it from books
    const resolvedFavoriteBooks = useMemo(() => {
        if (favoriteBooks && favoriteBooks.length > 0) return favoriteBooks;
        if (books && books.length > 0) {
            return books.filter(
                (b) =>
                    !b.trash &&
                    b.folder !== 'Trash' &&
                    b.folder !== 'Recent Book' &&
                    b.folder !== 'Recent' &&
                    Boolean(b.isFavorite || b.favorite || b.isFav)
            );
        }
        return [];
    }, [favoriteBooks, books]);

    const [selectedIds, setSelectedIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [folderFilter, setFolderFilter] = useState('All Folders');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [sortOption, setSortOption] = useState('Recently Created');

    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [activeMenuBookId, setActiveMenuBookId] = useState(null);

    const folderDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);
    const moreMenuRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (folderDropdownRef.current && !folderDropdownRef.current.contains(e.target)) {
                setIsFolderOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
                setIsStatusOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
                setIsSortOpen(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
                setActiveMenuBookId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDisplayDate = (dateVal) => {
        if (propFormatDate) return propFormatDate(dateVal);
        if (!dateVal) return '';
        if (typeof dateVal === 'string' && dateVal.includes('-') && dateVal.includes(' ')) {
            const parts = dateVal.split(' ')[0].split('-');
            if (parts.length === 3 && parts[2].length === 4) return dateVal.replace(/-/g, '/');
        }

        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return String(dateVal).replace(/-/g, '/');

        const pad = (n) => n.toString().padStart(2, '0');
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear();

        let hours = d.getHours();
        const minutes = pad(d.getMinutes());
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        return `${day}/${month}/${year} ${pad(hours)}:${minutes} ${ampm}`;
    };

    const formatDisplaySize = (book) => {
        if (propFormatSize) return propFormatSize(book);
        const bytes = book?.fileSize || book?.sizeBytes || 0;
        const num = Number(bytes);
        if (!isNaN(num) && num > 0) {
            if (num >= 1000000000) {
                const gb = num / 1000000000;
                return `${parseFloat(gb.toFixed(gb >= 10 ? 1 : 2))} GB`;
            }
            if (num >= 1000000) {
                const mb = num / 1000000;
                return `${parseFloat(mb.toFixed(mb >= 10 ? 1 : 2))} MB`;
            }
            if (num >= 1000) {
                return `${Math.round(num / 1000)} KB`;
            }
            return `${num} B`;
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

    const getBookKey = (b) => b.id || b._id || b.v_id || b.realName;

    // Available folders for filter dropdown
    const availableFolders = useMemo(() => {
        const set = new Set();
        resolvedFavoriteBooks.forEach((b) => {
            if (b.folder && b.folder !== 'Recent Book' && b.folder !== 'Recent' && b.folder !== 'Trash') {
                set.add(b.folder);
            }
        });
        if (folders && folders.length > 0) {
            folders.forEach((f) => {
                if (f.name && f.name !== 'Recent Book' && f.name !== 'Trash') set.add(f.name);
            });
        }
        return ['All Folders', ...Array.from(set)];
    }, [resolvedFavoriteBooks, folders]);

    const filteredBooks = useMemo(() => {
        return (resolvedFavoriteBooks || [])
            .filter((book) => {
                const title = (book.title || book.realName || book.flipbookName || '').toLowerCase();
                const query = searchQuery.trim().toLowerCase();
                if (query && !title.includes(query)) return false;

                if (folderFilter !== 'All Folders') {
                    if (book.folder !== folderFilter) return false;
                }

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
                    return (
                        new Date(b.updatedAt || b.lastUpdated || b.mtime || b.createdAt || 0) -
                        new Date(a.updatedAt || a.lastUpdated || a.mtime || a.createdAt || 0)
                    );
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
    }, [resolvedFavoriteBooks, searchQuery, folderFilter, statusFilter, sortOption]);

    const isAllSelected = filteredBooks.length > 0 && filteredBooks.every((b) => selectedIds.includes(getBookKey(b)));
    const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

    const toggleCardSelection = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Clear selection when clicking outside cards and bulk controls
    useEffect(() => {
        if (!selectedIds || selectedIds.length === 0) return;

        const handleOutsideClick = (e) => {
            const target = e.target;
            if (
                target.closest('[data-card-item="true"]') ||
                target.closest('[data-selection-keep="true"]') ||
                target.closest('[role="dialog"]') ||
                target.closest('.modal-content') ||
                target.closest('[data-modal="true"]')
            ) {
                return;
            }
            setSelectedIds([]);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedIds([]);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedIds]);

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

    const handleBulkRemoveFavorites = () => {
        if (selectedIds.length === 0) return;
        selectedIds.forEach((id) => {
            const b = resolvedFavoriteBooks.find((item) => getBookKey(item) === id);
            if (b && onToggleFavorite) {
                onToggleFavorite(b);
            }
        });
        setSelectedIds([]);
    };

    const handleBulkTrashClick = () => {
        if (selectedIds.length === 0) return;
        if (onBulkTrash) {
            onBulkTrash();
        } else if (onTrashBook) {
            selectedIds.forEach((id) => {
                const b = resolvedFavoriteBooks.find((item) => getBookKey(item) === id);
                if (b) onTrashBook(b);
            });
        }
        setSelectedIds([]);
    };

    const handleViewBook = (book) => {
        const shareId =
            book.Visibility?.shareId ||
            book.Customized_Settings?.Visibility?.shareId ||
            book.shareId ||
            book.share?.shareId ||
            book.v_id ||
            encodeURIComponent(book.realName);
        const rawAcc = String(
            book.Visibility?.access || book.Customized_Settings?.Visibility?.access || book.share?.access || 'public'
        ).toLowerCase();
        const accessPrefix = rawAcc.includes('private')
            ? 'share=private'
            : rawAcc.includes('password')
            ? 'share=password'
            : rawAcc.includes('invite')
            ? 'share=invite'
            : 'share=public';
        window.open(`/${accessPrefix}/${shareId}`, '_blank');
    };

    const handleCustomize = (book) => {
        let targetFolder = book.folder;
        if (targetFolder === 'Recent Book' || targetFolder === 'Recent') {
            const physical = books.find(
                (b) => b.realName === book.realName && b.folder !== 'Recent Book' && b.folder !== 'Recent'
            );
            if (physical) targetFolder = physical.folder;
        }
        const pageCountVal =
            (Array.isArray(book.pages)
                ? book.pages.length
                : typeof book.pages === 'number'
                ? book.pages
                : book.pagesCount) || 1;
        const pagesArray = Array.isArray(book.pagesList) && book.pagesList.length > 0 
            ? book.pagesList 
            : Array.isArray(book.pages) && book.pages.length > 0 && typeof book.pages[0] === 'object'
            ? book.pages
            : undefined;

        const folderVId = book.folder_v_id || (book.folder_id && String(book.folder_id).startsWith('fol_') ? book.folder_id : null) || 'fol_default';
        const identifier = book.v_id || encodeURIComponent(book.realName);
        navigate?.(
            `/editor/customized_editor/${encodeURIComponent(folderVId)}/${identifier}`,
            {
                state: {
                    flipbookName: book.realName,
                    pageCount: pageCountVal,
                    pages: pagesArray,
                    v_id: book.v_id,
                    folder_v_id: folderVId,
                    folderName: targetFolder || 'My_Flipbooks',
                    width: book.width,
                    height: book.height,
                    orientation: book.orientation
                }
            }
        );
    };

    const handleOpenEditor = (book) => {
        let targetFolder = book.folder;
        if (targetFolder === 'Recent Book' || targetFolder === 'Recent') {
            const physical = books.find(
                (b) => b.realName === book.realName && b.folder !== 'Recent Book' && b.folder !== 'Recent'
            );
            if (physical) targetFolder = physical.folder;
        }
        const pagesArray = Array.isArray(book.pagesList) && book.pagesList.length > 0 
            ? book.pagesList 
            : Array.isArray(book.pages) && book.pages.length > 0 && typeof book.pages[0] === 'object'
            ? book.pages
            : undefined;

        const folderVId = book.folder_v_id || (book.folder_id && String(book.folder_id).startsWith('fol_') ? book.folder_id : null) || 'fol_default';
        const identifier = book.v_id || encodeURIComponent(book.realName);
        navigate?.(`/editor/${encodeURIComponent(folderVId)}/${identifier}`, {
            state: {
                flipbookName: book.realName,
                pages: pagesArray,
                v_id: book.v_id,
                folder_v_id: folderVId,
                folderName: targetFolder || 'My_Flipbooks',
                width: book.width,
                height: book.height,
                orientation: book.orientation
            }
        });
    };

    return (
        <div className="flex flex-col w-full h-full px-[0.5vw] pb-0 pt-[0.2vw] overflow-visible font-sans text-gray-800">
            {/* Page Header */}
            <h2 className="text-[1.15vw] font-bold text-[#1f2937] mb-[0.6vw]">Favorites</h2>

            {/* Toolbar Row */}
            <div className="w-full mb-[0.8vw] relative z-20 flex-shrink-0" data-selection-keep="true">
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

                        {/* Folder Filter Dropdown */}
                        <div className="relative flex-shrink-0" ref={folderDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFolderOpen(!isFolderOpen);
                                    setIsStatusOpen(false);
                                    setIsSortOpen(false);
                                }}
                                className="flex items-center gap-[0.45vw] px-[0.85vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer whitespace-nowrap flex-shrink-0"
                            >
                                <Folder size="0.9vw" className="text-[#ec5137] flex-shrink-0" />
                                <span className="whitespace-nowrap">{folderFilter}</span>
                                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.2vw] flex-shrink-0" />
                            </button>

                            {isFolderOpen && (
                                <div className="absolute top-full left-0 mt-[0.25vw] min-w-[10vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 max-h-[14vw] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                    {availableFolders.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setFolderFilter(opt);
                                                setIsFolderOpen(false);
                                            }}
                                            className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors truncate cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] whitespace-nowrap ${
                                                folderFilter === opt
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

                        {/* Status Dropdown */}
                        <div className="relative flex-shrink-0" ref={statusDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsStatusOpen(!isStatusOpen);
                                    setIsFolderOpen(false);
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
                                    setIsFolderOpen(false);
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

                    {/* Right Controls: Bulk Actions & Multiple Selection */}
                    <div className="flex items-center gap-[0.6vw] flex-shrink-0">
                        {/* Bulk Action Buttons (when items selected) */}
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-[0.45vw] flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={handleBulkRemoveFavorites}
                                    className="flex items-center gap-[0.4vw] px-[0.75vw] py-[0.45vw] bg-white text-red-500 border border-red-200 rounded-[0.5vw] hover:bg-red-50 transition-colors shadow-sm text-[0.75vw] font-semibold cursor-pointer whitespace-nowrap flex-shrink-0"
                                >
                                    <Heart size="0.85vw" className="fill-red-500 text-red-500 flex-shrink-0" />
                                    <span className="whitespace-nowrap">Remove from Favorites ({selectedIds.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkTrashClick}
                                    className="flex items-center gap-[0.4vw] px-[0.75vw] py-[0.45vw] bg-white text-gray-700 border border-gray-200 rounded-[0.5vw] hover:bg-gray-50 transition-colors shadow-sm text-[0.75vw] font-semibold cursor-pointer whitespace-nowrap flex-shrink-0"
                                >
                                    <Trash2 size="0.85vw" className="text-gray-500 flex-shrink-0" />
                                    <span className="whitespace-nowrap">Move to Trash ({selectedIds.length})</span>
                                </button>
                            </div>
                        )}

                        {/* Select All Checkbox */}
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
                            <span className="text-[0.84vw] font-medium text-gray-600 whitespace-nowrap">Select All</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Favorite Books List */}
            {filteredBooks.length > 0 ? (
                <CustomScrollbar
                    color="#d1d5db"
                    hoverColor="#9ca3af"
                    width="0.35vw"
                    className="flex-1 pr-[0.3vw] pb-[2vw] z-10 space-y-[0.85vw] min-h-0"
                    onScroll={() => {
                        setActiveBookMenu?.(null);
                        setActiveMenuBookId?.(null);
                    }}
                >
                    {filteredBooks.map((book) => (
                        <FlipbookCard
                            key={getBookKey(book)}
                            book={book}
                            variant="favorites"
                            selectedIds={selectedIds}
                            toggleCardSelection={toggleCardSelection}
                            editingBookId={editingBookId}
                            tempBookTitle={tempBookTitle}
                            setTempBookTitle={setTempBookTitle}
                            saveBookEdit={saveBookEdit}
                            handleBookKeyDown={handleBookKeyDown}
                            onStartEdit={onRenameBook}
                            onToggleFavorite={onToggleFavorite}
                            activeFolder={book.folder || 'Favorites'}
                            emailId={emailId}
                            backendUrl={backendUrl}
                            formatDisplayDate={formatDisplayDate}
                            formatDisplaySize={formatDisplaySize}
                            renderStatusBadge={renderStatusBadge}
                            onShareClick={onShareClick}
                            onDownloadClick={onDownloadClick}
                            onViewBook={handleViewBook}
                            onCustomize={handleCustomize}
                            onOpenEditor={handleOpenEditor}
                            navigate={navigate}
                            books={books}
                            activeBookMenu={activeBookMenu || activeMenuBookId}
                            setActiveBookMenu={setActiveBookMenu || setActiveMenuBookId}
                            setMenuPosition={setMenuPosition || setLocalMenuPosition}
                        />
                    ))}
                </CustomScrollbar>
            ) : (
                /* Empty Favorites State */
                <div className="flex-1 flex flex-col items-center justify-center py-[5vw] text-center">
                    <div className="w-[4.5vw] h-[4.5vw] rounded-full bg-red-50 flex items-center justify-center mb-[1vw] text-red-400 shadow-sm border border-red-100">
                        <Heart size="2.2vw" className="fill-red-400 text-red-400" />
                    </div>
                    <h3 className="text-[1.1vw] font-bold text-gray-800 mb-[0.3vw]">No favorite flipbooks yet</h3>
                    <p className="text-[0.82vw] text-gray-400 max-w-[24vw]">
                        Discover flipbooks from other creators and click the heart icon to save them to your favorites for quick access.
                    </p>
                </div>
            )}

            {/* Fallback Fixed Portal for More Menu (when global menu isn't attached) */}
            {activeMenuBookId && !setActiveBookMenu && (() => {
                const activeBook = filteredBooks.find((b) => (b.id || b._id || b.v_id) === activeMenuBookId);
                if (!activeBook) return null;
                return (
                    <>
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuBookId(null);
                            }}
                        />
                        <div
                            className="fixed z-[101] w-[12vw] min-w-[165px] bg-white rounded-[0.75vw] shadow-xl border border-gray-500 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                            style={{
                                top: localMenuPosition.top,
                                left: localMenuPosition.left,
                                transform: localMenuPosition.isDropup ? 'translate(-100%, -100%)' : 'translate(-100%, 0)'
                            }}
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuBookId(null);
                                    onShareClick?.(activeBook);
                                }}
                                className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-700 hover:bg-black hover:text-white transition-colors border-b border-gray-100 group cursor-pointer"
                            >
                                <Share2 size="0.9vw" className="group-hover:text-white" />
                                <span>Share</span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuBookId(null);
                                    onDownloadClick?.(activeBook);
                                }}
                                className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-700 hover:bg-black hover:text-white transition-colors border-b border-gray-100 group cursor-pointer"
                            >
                                <Download size="0.9vw" className="group-hover:text-white" />
                                <span>Download</span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuBookId(null);
                                    if (onToggleFavorite) onToggleFavorite(activeBook);
                                }}
                                className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-600 hover:bg-black hover:text-white transition-colors border-b border-gray-50 group cursor-pointer"
                            >
                                <Heart size="0.9vw" className="text-red-500 fill-red-500" />
                                <span>Remove from Favorites</span>
                            </button>
                            {onTrashBook && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuBookId(null);
                                        onTrashBook(activeBook);
                                    }}
                                    className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-red-500 hover:bg-red-500 hover:text-white transition-colors group cursor-pointer"
                                >
                                    <Trash2 size="0.9vw" className="group-hover:text-white" />
                                    <span>Move to trash</span>
                                </button>
                            )}
                        </div>
                    </>
                );
            })()}
        </div>
    );
}
