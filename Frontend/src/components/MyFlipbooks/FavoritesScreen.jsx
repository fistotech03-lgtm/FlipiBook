import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, ArrowDownUp, Heart, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Icon } from '@iconify/react';
import CustomScrollbar from '../CustomScrollbar';
import cover1 from '../../assets/Explore/c-bg1.png';
import p1 from '../../assets/Explore/p1.png';

// 10 Clean Dummy Cards matching Explore book card style with light orange cover
const DUMMY_FAVORITES_CARDS = Array.from({ length: 10 }, (_, index) => ({
    id: `fav-${index + 1}`,
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
    isFavorite: true
}));

export default function FavoritesScreen({ navigate }) {
    const [cards, setCards] = useState(DUMMY_FAVORITES_CARDS);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSort, setActiveSort] = useState('Default');

    const filterDropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);

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

    const toggleFavorite = (id, e) => {
        e.stopPropagation();
        setCards(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    };

    const filteredCards = useMemo(() => {
        return cards
            .filter(card => {
                const query = searchQuery.trim().toLowerCase();
                const matchesQuery = !query ||
                    card.title.toLowerCase().includes(query) ||
                    card.authorName.toLowerCase().includes(query) ||
                    card.location.toLowerCase().includes(query);

                if (!matchesQuery) return false;
                if (activeFilter === 'Favorited') return card.isFavorite;
                if (activeFilter === 'High Rated') return card.rating >= 4.5;
                if (activeFilter === 'Popular') return card.viewsCount >= 10000;
                return true;
            })
            .sort((a, b) => {
                if (activeSort === 'Name (A-Z)') return a.title.localeCompare(b.title);
                if (activeSort === 'Rating') return b.rating - a.rating;
                if (activeSort === 'Views') return b.viewsCount - a.viewsCount;
                return 0;
            });
    }, [cards, searchQuery, activeFilter, activeSort]);

    return (
        <div className="flex-1 w-full h-full flex flex-col min-h-0 bg-[#f8f9fb] select-none">
            {/* Top Toolbar matching Create Flipbooks layout style */}
            <div className="w-full mb-[0.9vw] relative z-20 flex-shrink-0">
                <div className="flex items-center justify-between gap-[0.75vw]">
                    <div>
                        <h2 className="text-[1.25vw] font-bold text-[#1f2937] leading-tight">
                            Favorites
                        </h2>
                        <p className="text-[0.82vw] text-gray-500 font-normal mt-[0.1vw]">
                            Ready to create something amazing today?
                        </p>
                    </div>

                    {/* Right: Search & Dropdowns */}
                    <div className="flex items-center gap-[0.75vw]">
                        {/* Search Input */}
                        <div className="relative w-[18vw]">
                            <Search
                                size="0.95vw"
                                className="absolute left-[0.9vw] top-1/2 -translate-y-1/2 text-[#ec5137]"
                            />
                            <input
                                type="text"
                                placeholder="Search Flipbook..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-[2.4vw] pr-[1vw] py-[0.5vw] rounded-[0.6vw] border border-gray-200 text-[0.84vw] focus:outline-none focus:ring-1 focus:ring-[#ec5137] bg-white text-gray-700 placeholder-gray-400 shadow-xs"
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
                                className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-xs font-medium cursor-pointer"
                            >
                                <Filter size="0.9vw" className="text-[#ec5137]" />
                                <span>{activeFilter === 'All' ? 'Filter' : activeFilter}</span>
                                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.2vw]" />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-[0.25vw] w-[10vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 py-[0.25vw]">
                                    {['All', 'Favorited', 'Popular', 'High Rated'].map((opt) => (
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
                                className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-xs font-medium cursor-pointer"
                            >
                                <ArrowDownUp size="0.9vw" className="text-[#ec5137]" />
                                <span>{activeSort === 'Default' ? 'Sort by' : activeSort}</span>
                                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.2vw]" />
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
                        <p className="text-[0.9vw] font-medium text-gray-500">No favorite flipbooks found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-[1.1vw]">
                        {filteredCards.map((book) => (
                            <div
                                key={book.id}
                                className="bg-white rounded-[0.7vw] overflow-hidden flex flex-col shadow-[0_0.25vw_1.2vw_rgba(0,0,0,0.05)] hover:shadow-[0_0.5vw_1.8vw_rgba(0,0,0,0.08)] transition-all border-[0.06vw] border-transparent hover:border-gray-100 relative group cursor-pointer"
                            >
                                {/* Explore Book Image Area (4:3 ratio) */}
                                <div className="relative w-full aspect-[4/3] bg-[#fae8dc] overflow-hidden">
                                    <img
                                        src={book.cover}
                                        alt={book.title || "Flipbook Cover"}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />

                                    {/* Top Right Heart Badge */}
                                    <button
                                        type="button"
                                        onClick={(e) => toggleFavorite(book.id, e)}
                                        className="absolute top-[0.6vw] right-[0.6vw] w-[1.9vw] h-[1.9vw] rounded-full bg-white shadow-[0_0.15vw_0.5vw_rgba(0,0,0,0.12)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer z-10"
                                        title={book.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <Heart
                                            size="0.95vw"
                                            className={book.isFavorite ? 'fill-[#ef4444] text-[#ef4444]' : 'text-gray-400 hover:text-[#ef4444]'}
                                        />
                                    </button>
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
                                            <span className="text-black font-semibold">{(Array.isArray(book.pages) ? book.pages.length : (typeof book.pages === 'number' ? book.pages : book.pagesCount)) || 0}</span>
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

                                    {/* Title & Desc & Button */}
                                    <div className="relative flex-1 mt-[0.65vw]">
                                        <h4 className="text-[0.88vw] font-semibold text-black truncate tracking-tight mb-[0.2vw]" title={book.title}>
                                            {book.title}
                                        </h4>
                                        <p className="text-[0.7vw] text-gray-500 leading-relaxed pr-[2.4vw] line-clamp-2">
                                            {book.description}
                                        </p>

                                        {/* Action Button */}
                                        <button
                                            type="button"
                                            onClick={() => navigate?.('/home')}
                                            className="absolute bottom-0 right-0 bg-black text-white w-[1.9vw] h-[1.9vw] rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-[0_0.15vw_0.5vw_rgba(0,0,0,0.15)] cursor-pointer hover:scale-105 active:scale-95"
                                            title="Open flipbook"
                                        >
                                            <Icon icon="mdi:arrow-top-right" className="w-[1.1vw] h-[1.1vw]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CustomScrollbar>
        </div>
    );
}
