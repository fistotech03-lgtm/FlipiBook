import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, ArrowDownUp, Trash2, RotateCcw, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Icon } from '@iconify/react';
import CustomScrollbar from '../CustomScrollbar';
import cover1 from '../../assets/Explore/c-bg1.png';
import p1 from '../../assets/Explore/p1.png';

// 10 Clean Dummy Cards matching Explore book card style with light orange cover
const DUMMY_TRASH_CARDS = Array.from({ length: 10 }, (_, index) => ({
    id: `trash-${index + 1}`,
    title: 'Name of the Flipbook',
    authorName: 'Alex Johnson',
    location: 'Coimbatore',
    authorPicture: p1,
    cover: cover1,
    pages: 12,
    views: '12.5k',
    viewsCount: 12500,
    rating: 4.5,
    description: '“Bring your content to life with a real, interactive experience”',
    deletedDaysAgo: (index * 2) + 1
}));

export default function TrashScreen({
    navigate,
    trashedBooks,
    onEmptyTrash,
    onRestoreBook,
    onDeleteBook,
    onBulkRestore,
    onBulkDelete
}) {
    const mapBookToCard = (b, index) => ({
        id: b.id || b._id || `trash-${index + 1}`,
        title: b.title || b.realName || 'Name of the Flipbook',
        authorName: b.authorName || b.author || 'Alex Johnson',
        location: b.location || 'Coimbatore',
        authorPicture: b.authorPicture || p1,
        cover: b.cover || (b.image ? (b.image.startsWith('http') || b.image.startsWith('data:') ? b.image : `${import.meta.env.VITE_BACKEND_URL || ''}${b.image.startsWith('/') ? '' : '/'}${b.image}`) : cover1),
        pages: Array.isArray(b.pages) ? b.pages.length : (b.pageCount || b.pages || 12),
        views: b.views || '12.5k',
        viewsCount: typeof b.viewsCount === 'number' ? b.viewsCount : 12500,
        rating: b.rating || 4.5,
        description: b.description || '“Bring your content to life with a real, interactive experience”',
        deletedDaysAgo: b.deletedDaysAgo ?? (b.deletedAt ? Math.max(0, Math.floor((Date.now() - new Date(b.deletedAt)) / (1000 * 60 * 60 * 24))) : ((index * 2) + 1)),
        rawBook: b
    });

    const [cards, setCards] = useState(() => {
        if (trashedBooks !== undefined) {
            return trashedBooks.map((b, i) => mapBookToCard(b, i));
        }
        return DUMMY_TRASH_CARDS;
    });

    const [selectedIds, setSelectedIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSort, setActiveSort] = useState('Default');
    const [toastMessage, setToastMessage] = useState(null);

    const filterDropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);

    useEffect(() => {
        if (trashedBooks !== undefined) {
            setCards(trashedBooks.map((b, i) => mapBookToCard(b, i)));
        }
    }, [trashedBooks]);

    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(null), 2500);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
                setIsFilterOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCards = useMemo(() => {
        return cards
            .filter(card => {
                const query = searchQuery.trim().toLowerCase();
                const matchesQuery = !query ||
                    card.title.toLowerCase().includes(query) ||
                    card.authorName.toLowerCase().includes(query) ||
                    card.location.toLowerCase().includes(query);

                if (!matchesQuery) return false;
                if (activeFilter === 'Recent (< 7 days)') return card.deletedDaysAgo < 7;
                if (activeFilter === 'Older (7+ days)') return card.deletedDaysAgo >= 7;
                return true;
            })
            .sort((a, b) => {
                if (activeSort === 'Name (A-Z)') return a.title.localeCompare(b.title);
                if (activeSort === 'Rating') return b.rating - a.rating;
                if (activeSort === 'Views') return b.viewsCount - a.viewsCount;
                return 0;
            });
    }, [cards, searchQuery, activeFilter, activeSort]);

    const isAllSelected = filteredCards.length > 0 && filteredCards.every(c => selectedIds.includes(c.id));

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCards.map(c => c.id));
        }
    };

    const handleToggleCardSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleRestore = (card, e) => {
        if (e) e.stopPropagation();
        setCards(prev => prev.filter(c => c.id !== card.id));
        setSelectedIds(prev => prev.filter(id => id !== card.id));
        setToastMessage(`Restored "${card.title}" successfully`);
        if (onRestoreBook) onRestoreBook(card.rawBook || card);
    };

    const handleDeletePermanent = (card, e) => {
        if (e) e.stopPropagation();
        setCards(prev => prev.filter(c => c.id !== card.id));
        setSelectedIds(prev => prev.filter(id => id !== card.id));
        setToastMessage(`Permanently deleted "${card.title}"`);
        if (onDeleteBook) onDeleteBook(card.rawBook || card);
    };

    const handleBulkRestoreClick = () => {
        if (selectedIds.length === 0) return;
        const count = selectedIds.length;
        const idsToRestore = [...selectedIds];
        setCards(prev => prev.filter(c => !idsToRestore.includes(c.id)));
        setSelectedIds([]);
        setToastMessage(`Restored ${count} flipbook${count > 1 ? 's' : ''}`);
        if (onBulkRestore) onBulkRestore(idsToRestore);
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) return;
        const count = selectedIds.length;
        const idsToDelete = [...selectedIds];
        setSelectedIds([]);
        if (onBulkDelete) {
            onBulkDelete(idsToDelete);
        } else {
            setCards(prev => prev.filter(c => !idsToDelete.includes(c.id)));
            setToastMessage(`Permanently deleted ${count} flipbook${count > 1 ? 's' : ''}`);
        }
    };

    const handleEmptyAll = () => {
        if (cards.length === 0) return;
        setCards([]);
        setSelectedIds([]);
        setToastMessage('Trash has been emptied');
        if (onEmptyTrash) onEmptyTrash();
    };

    return (
        <div className="flex-1 w-full h-full flex flex-col min-h-0 bg-[#f8f9fb] select-none relative">
            {toastMessage && (
                <div className="absolute top-[0.5vw] right-[1vw] z-50 bg-[#1e293b] text-white text-[0.78vw] font-medium px-[0.9vw] py-[0.45vw] rounded-[0.5vw] shadow-lg flex items-center gap-[0.4vw] animate-in fade-in slide-in-from-top-2 duration-200">
                    <Check size="0.85vw" className="text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Top Toolbar matching Create Flipbooks layout style */}
            <div className="w-full mb-[0.9vw] relative z-20 flex-shrink-0">
                <div className="flex items-center justify-between gap-[0.75vw]">
                    <div>
                        <h2 className="text-[1.25vw] font-bold text-[#1f2937] leading-tight flex items-center gap-[0.45vw]">
                            <span>Trash</span>
                            <span className="text-[0.82vw] font-semibold text-red-500 bg-red-50 px-[0.55vw] py-[0.1vw] rounded-full border border-red-200/70">
                                {cards.length}
                            </span>
                        </h2>
                        <p className="text-[0.82vw] text-gray-500 font-normal mt-[0.1vw]">
                            Items in trash can be restored or permanently removed
                        </p>
                    </div>

                    {/* Right: Search, Filter, Sort, Bulk Actions & Selection */}
                    <div className="flex items-center gap-[0.65vw]">
                        {/* Bulk Action Buttons when cards are selected */}
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-[0.45vw] animate-in fade-in duration-150">
                                <button
                                    type="button"
                                    onClick={handleBulkRestoreClick}
                                    className="flex items-center gap-[0.35vw] px-[0.8vw] py-[0.48vw] bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-[0.55vw] text-[0.8vw] font-semibold shadow-xs cursor-pointer transition-colors"
                                    title="Restore selected flipbooks"
                                >
                                    <RotateCcw size="0.85vw" />
                                    <span>Restore ({selectedIds.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkDeleteClick}
                                    className="flex items-center gap-[0.35vw] px-[0.8vw] py-[0.48vw] bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-[0.55vw] text-[0.8vw] font-semibold shadow-xs cursor-pointer transition-colors"
                                    title="Permanently delete selected flipbooks"
                                >
                                    <Trash2 size="0.85vw" />
                                    <span>Delete Permanently ({selectedIds.length})</span>
                                </button>
                            </div>
                        )}

                        {/* Search Input */}
                        <div className="relative w-[14vw]">
                            <Search
                                size="0.95vw"
                                className="absolute left-[0.9vw] top-1/2 -translate-y-1/2 text-[#ec5137]"
                            />
                            <input
                                type="text"
                                placeholder="Search Flipbook..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-[2.4vw] pr-[1vw] py-[0.48vw] rounded-[0.6vw] border border-gray-200 text-[0.82vw] focus:outline-none focus:ring-1 focus:ring-[#ec5137] bg-white text-gray-700 placeholder-gray-400 shadow-xs"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative" ref={filterDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFilterOpen(!isFilterOpen);
                                    setIsSortOpen(false);
                                }}
                                className="flex items-center gap-[0.4vw] px-[0.8vw] py-[0.48vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.82vw] text-gray-700 hover:bg-gray-50 shadow-xs font-medium cursor-pointer"
                            >
                                <Filter size="0.85vw" className="text-[#ec5137]" />
                                <span>{activeFilter === 'All' ? 'Filter' : activeFilter}</span>
                                <ChevronDown size="0.8vw" className="text-gray-400 ml-[0.15vw]" />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-[0.25vw] w-[12vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 py-[0.25vw]">
                                    {['All', 'Recent (< 7 days)', 'Older (7+ days)'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setActiveFilter(opt);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full text-left px-[0.9vw] py-[0.45vw] text-[0.8vw] flex items-center justify-between cursor-pointer ${
                                                activeFilter === opt
                                                    ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span>{opt}</span>
                                            {activeFilter === opt && <Check size="0.75vw" className="text-[#ec5137]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort by Dropdown */}
                        <div className="relative" ref={sortDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSortOpen(!isSortOpen);
                                    setIsFilterOpen(false);
                                }}
                                className="flex items-center gap-[0.4vw] px-[0.8vw] py-[0.48vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.82vw] text-gray-700 hover:bg-gray-50 shadow-xs font-medium cursor-pointer"
                            >
                                <ArrowDownUp size="0.85vw" className="text-[#ec5137]" />
                                <span>{activeSort === 'Default' ? 'Sort by' : activeSort}</span>
                                <ChevronDown size="0.8vw" className="text-gray-400 ml-[0.15vw]" />
                            </button>

                            {isSortOpen && (
                                <div className="absolute right-0 top-full mt-[0.25vw] w-[11vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 py-[0.25vw]">
                                    {['Default', 'Name (A-Z)', 'Views', 'Rating'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setActiveSort(opt);
                                                setIsSortOpen(false);
                                            }}
                                            className={`w-full text-left px-[0.9vw] py-[0.45vw] text-[0.8vw] flex items-center justify-between cursor-pointer ${
                                                activeSort === opt
                                                    ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span>{opt}</span>
                                            {activeSort === opt && <Check size="0.75vw" className="text-[#ec5137]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Multiple Selection Checkbox */}
                        {cards.length > 0 && (
                            <label
                                className="flex items-center gap-[0.45vw] px-[0.6vw] py-[0.48vw] cursor-pointer select-none border border-gray-200 bg-white rounded-[0.6vw] hover:bg-gray-50 shadow-xs transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleToggleSelectAll();
                                }}
                            >
                                <div className={`w-[1.1vw] h-[1.1vw] rounded-[0.2vw] border flex items-center justify-center transition-all ${
                                    isAllSelected ? 'bg-gray-800 border-gray-800' : 'border-gray-400 bg-white'
                                }`}>
                                    {isAllSelected && <Check size="0.75vw" className="text-white" strokeWidth={3} />}
                                </div>
                                <span className="text-[0.82vw] font-medium text-gray-700">Multiple Selection</span>
                            </label>
                        )}

                        {/* Empty Trash Button (when not selecting specific items) */}
                        {cards.length > 0 && selectedIds.length === 0 && (
                            <button
                                type="button"
                                onClick={handleEmptyAll}
                                className="flex items-center gap-[0.35vw] px-[0.8vw] py-[0.48vw] bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-[0.6vw] text-[0.82vw] font-semibold shadow-xs cursor-pointer transition-colors"
                            >
                                <Trash2 size="0.85vw" />
                                <span>Empty Trash</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid of Explore-Style Book Cards */}
            <CustomScrollbar
                color="#d1d5db"
                hoverColor="#9ca3af"
                width="0.35vw"
                className="flex-1 pr-[0.3vw] pb-[2vw] min-h-0"
            >
                {filteredCards.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-[5vw] text-gray-400">
                        <Sparkles size="2.5vw" className="text-gray-300 mb-[0.6vw]" />
                        <p className="text-[0.9vw] font-medium text-gray-500">Trash is completely empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-[1.1vw]">
                        {filteredCards.map((book) => {
                            const isSelected = selectedIds.includes(book.id);

                            return (
                                <div
                                    key={book.id}
                                    onClick={() => {
                                        if (selectedIds.length > 0) {
                                            handleToggleCardSelection(book.id);
                                        }
                                    }}
                                    className={`bg-white rounded-[0.7vw] overflow-hidden flex flex-col shadow-[0_0.25vw_1.2vw_rgba(0,0,0,0.05)] hover:shadow-[0_0.5vw_1.8vw_rgba(0,0,0,0.08)] transition-all border relative group cursor-pointer ${
                                        isSelected
                                            ? 'border-red-400 ring-2 ring-red-400/50 shadow-md'
                                            : 'border-transparent hover:border-gray-200'
                                    }`}
                                >
                                    {/* Explore Book Image Area (4:3 ratio) */}
                                    <div className="relative w-full aspect-[4/3] bg-[#fae8dc] overflow-hidden">
                                        <img
                                            src={book.cover}
                                            alt={book.title || "Flipbook Cover"}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />

                                        {/* Card Selection Checkbox (Top Left) */}
                                        <div
                                            className={`absolute top-[0.6vw] left-[0.6vw] z-20 cursor-pointer transition-all duration-200 ${
                                                isSelected || selectedIds.length > 0
                                                    ? 'opacity-100 scale-100'
                                                    : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleCardSelection(book.id);
                                            }}
                                        >
                                            <div className={`w-[1.3vw] h-[1.3vw] rounded-[0.25vw] border flex items-center justify-center transition-all shadow-md ${
                                                isSelected
                                                    ? 'bg-gray-800 border-gray-800 text-white'
                                                    : 'bg-white/95 border-gray-300 text-transparent hover:border-gray-500'
                                            }`}>
                                                <Check size="0.85vw" className={isSelected ? "text-white" : "opacity-0"} strokeWidth={3} />
                                            </div>
                                        </div>

                                        {/* Top Right Trash Status Badge */}
                                        <div
                                            className="absolute top-[0.6vw] right-[0.6vw] w-[1.9vw] h-[1.9vw] rounded-full bg-white shadow-[0_0.15vw_0.5vw_rgba(0,0,0,0.12)] flex items-center justify-center z-10"
                                            title={`In trash (${book.deletedDaysAgo} days ago)`}
                                        >
                                            <Trash2 size="0.95vw" className="text-[#ef4444]" />
                                        </div>
                                    </div>

                                    {/* Explore Card Details */}
                                    <div className="p-[0.9vw] flex flex-col flex-1 bg-white justify-between">
                                        {/* Author Info */}
                                        <div className="flex items-center gap-[0.65vw]">
                                            <img
                                                src={book.authorPicture}
                                                alt={book.authorName}
                                                className="w-[2.2vw] h-[2.2vw] rounded-full border-[0.06vw] border-gray-200 object-cover shrink-0"
                                            />
                                            <div className="flex flex-col min-w-0 pr-[0.2vw]">
                                                <span className="text-[0.82vw] font-semibold text-gray-900 leading-tight truncate">
                                                    {book.authorName}
                                                </span>
                                                <span className="flex items-center gap-[0.2vw] text-[0.68vw] text-gray-400 mt-[0.1vw] truncate">
                                                    <Icon icon="lucide:map-pin" className="w-[0.7vw] h-[0.7vw] text-gray-400 shrink-0" />
                                                    <span className="truncate">{book.location}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats: Pages | Views | Rating */}
                                        <div className="flex items-center gap-[0.45vw] justify-start text-[0.72vw] text-gray-700 font-medium mt-[0.75vw] whitespace-nowrap">
                                            <div className="flex items-center gap-[0.2vw]">
                                                <span className="text-black font-semibold">{book.pages}</span>
                                                <span className="font-normal text-gray-500">Pages</span>
                                            </div>
                                            <span className="text-gray-300">|</span>
                                            <span className="flex items-center gap-[0.2vw]">
                                                <Icon icon="lucide:eye" className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                                                <span>{book.views}</span>
                                            </span>
                                            <span className="text-gray-300">|</span>
                                            <span className="flex items-center gap-[0.2vw]">
                                                <Icon icon="material-symbols:star" className="w-[0.9vw] h-[0.9vw] text-yellow-400" />
                                                <span>{book.rating}</span>
                                            </span>
                                        </div>

                                        {/* Title & Desc & Buttons */}
                                        <div className="relative flex-1 mt-[0.65vw]">
                                            <h4 className="text-[0.88vw] font-semibold text-black truncate tracking-tight mb-[0.2vw]" title={book.title}>
                                                {book.title}
                                            </h4>
                                            <p className="text-[0.7vw] text-gray-500 leading-relaxed pr-[3.8vw] line-clamp-2">
                                                {book.description}
                                            </p>

                                            {/* Action Buttons: Restore & Delete */}
                                            <div className="absolute bottom-0 right-0 flex items-center gap-[0.35vw]">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleRestore(book, e)}
                                                    className="w-[1.7vw] h-[1.7vw] rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center border-[0.06vw] border-blue-200 transition-colors shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                                                    title="Restore flipbook"
                                                >
                                                    <RotateCcw size="0.85vw" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeletePermanent(book, e)}
                                                    className="w-[1.7vw] h-[1.7vw] rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center border-[0.06vw] border-red-200 transition-colors shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                                                    title="Delete permanently"
                                                >
                                                    <Trash2 size="0.85vw" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CustomScrollbar>
        </div>
    );
}
