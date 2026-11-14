import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Search, ChevronDown, ArrowDownUp } from 'lucide-react';
import exploreHeroImg from '../assets/Explore/explore-hero-section.png';
import Footer from './Footer';
import ShareModal from '../components/ShareModal';
import ExportModal from '../components/ExportModal';
import CreatorProfileModal from './CreatorProfileModal';
import { useToast } from '../components/CustomToast';
import { useAuth } from '../context/AuthContext';
import { LazyPreview } from '../components/MyFlipbooks/LazyPreview';
import { resolveUploadsPath, getAssetBaseUrl } from '../utils/assetUtils';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');

const defaultColors = [
    '#4c5add', '#2563eb', '#059669', '#d97706', '#dc2626',
    '#7c3aed', '#db2777', '#0891b2', '#8a4419', '#597810'
];

const defaultGradients = [
    'linear-gradient(to bottom right, #059669, #a7f3d0)',
    'linear-gradient(to bottom right, #d97706, #fde68a)',
    'linear-gradient(to bottom right, #2563eb, #bfdbfe)',
    'linear-gradient(to bottom right, #dc2626, #fecaca)',
    'linear-gradient(to bottom right, #0d9488, #99f6e4)'
];

const getAvatarColor = (identifier, customColor) => {
    if (customColor && customColor !== '#E8D4C8' && customColor !== '#ffffff' && customColor !== 'transparent') {
        return customColor;
    }
    if (!identifier) return defaultColors[0];
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
        hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    return defaultColors[Math.abs(hash) % defaultColors.length];
};

const CustomDropdown = ({ options, value, onChange, className, buttonClassName, renderButton }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className || ''}`} ref={dropdownRef}>
            {renderButton ? (
                renderButton(value, isOpen, setIsOpen)
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-between w-full border-[1.5px] border-gray-300 rounded-[0.5vw] px-[1vw] py-[0.6vh] text-[0.9vw] text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer ${buttonClassName || ''}`}
                >
                    <span className="font-medium pr-[0.8vw] truncate">{value}</span>
                    <Icon icon="lucide:chevron-down" className={`w-[0.9vw] h-[0.9vw] text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            )}

            {isOpen && (
                <div className="absolute top-full right-0 mt-[0.5vh] w-[12vw] min-w-[140px] bg-white rounded-[0.5vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-[0.8vh] z-50 border border-gray-100">
                    {options.map((opt, idx) => (
                        <div
                            key={idx}
                            onClick={() => { onChange(opt); setIsOpen(false); }}
                            className="px-[0.8vw] py-[0.7vh] text-[0.8vw] text-gray-700 hover:bg-gray-50 hover:text-black cursor-pointer transition-colors font-medium truncate"
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const FlipbookCard = ({ v_id, shareId, access, rawBook, authorPicture, authorBgColor, bookName, authorName, location, pages, views, rating, description, onShare, onDownload, onProfileClick, onToggleFavorite, isFavorited, isOwner }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const menuRef = useRef(null);

    const handleOpenBook = () => {
        const targetShareId = shareId || v_id;
        const rawAcc = String(access).toLowerCase();
        if (targetShareId) {
            window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const displayAvatar = (authorPicture && authorPicture !== 'color_only' && authorPicture !== 'null') ? authorPicture : null;
    const resolvedAvatar = displayAvatar
        ? (displayAvatar.startsWith('blob:') || displayAvatar.startsWith('data:') ? displayAvatar : resolveUploadsPath(displayAvatar))
        : null;
    const avatarColor = getAvatarColor(authorName || rawBook?.userEmail, authorBgColor);

    const isShareEnabled = (book) => {
        if (!book) return true;
        const target = book.rawBook || book;
        const cs = target.Customized_Settings || target.settings || {};
        if (cs.MenuBar?.shareExport?.share !== undefined) return Boolean(cs.MenuBar.shareExport.share);
        if (cs.shareExport?.share !== undefined) return Boolean(cs.shareExport.share);
        if (cs.Other_Setup?.shareExport?.share !== undefined) return Boolean(cs.Other_Setup.shareExport.share);
        if (cs.ShareExport?.share !== undefined) return Boolean(cs.ShareExport.share);
        if (target.shareExport?.share !== undefined) return Boolean(target.shareExport.share);
        return true;
    };

    const isDownloadEnabled = (book) => {
        if (!book) return true;
        const target = book.rawBook || book;
        const cs = target.Customized_Settings || target.settings || {};
        if (cs.MenuBar?.shareExport?.download !== undefined) return Boolean(cs.MenuBar.shareExport.download);
        if (cs.shareExport?.download !== undefined) return Boolean(cs.shareExport.download);
        if (cs.Other_Setup?.shareExport?.download !== undefined) return Boolean(cs.Other_Setup.shareExport.download);
        if (cs.ShareExport?.download !== undefined) return Boolean(cs.ShareExport.download);
        if (target.shareExport?.download !== undefined) return Boolean(target.shareExport.download);
        return true;
    };

    const canShare = isShareEnabled(rawBook);
    const canDownload = isDownloadEnabled(rawBook);

    const userFolder = rawBook?.userID || rawBook?.userId || rawBook?.userEmail?.replace(/[@.]/g, '_');
    const folderName = rawBook?.folderName || 'default';
    const bookTitle = rawBook?.flipbookName || rawBook?.realName || bookName;
    const resolvedIframeBaseUrl = getAssetBaseUrl(userFolder, folderName, bookTitle);
    const firstPageContent = rawBook?.pages?.[0]?.html || rawBook?.pages?.[0]?.content || null;
    const firstPageFileName = rawBook?.pages?.[0]?.pageName || 'Page 1.svg';

    const menuItems = [
        {
            name: 'View Book',
            icon: <Icon icon="solar:eye-linear" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />,
            action: handleOpenBook
        },
        {
            name: 'Creator Profile',
            icon: <Icon icon="solar:user-bold" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />,
            action: () => onProfileClick && onProfileClick({ name: authorName, profileImg: resolvedAvatar, picture: resolvedAvatar, role: 'Creator', email: rawBook?.userEmail, emailId: rawBook?.userEmail, avatarBgColor: authorBgColor, location, v_id, shareId })
        },
        ...(canShare ? [{
            name: 'Share',
            icon: <Icon icon="solar:share-linear" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />,
            action: () => onShare && onShare(rawBook)
        }] : []),
        ...(canDownload ? [{
            name: 'Download',
            icon: <Icon icon="solar:download-linear" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />,
            action: () => onDownload && onDownload(rawBook)
        }] : []),
        {
            name: 'Report',
            icon: <Icon icon="solar:danger-circle-linear" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />,
            action: () => alert("Flipbook reported successfully. Our team will review it.")
        }
    ];

    return (
        <div
            onClick={handleOpenBook}
            className="bg-white rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow border border-gray-100/80 relative group cursor-pointer"
        >
            {/* Image Area Wrapper (1st page preview) */}
            <div className="relative w-full aspect-[4/3] bg-white rounded-t-xl overflow-hidden flex items-center justify-center border-b border-gray-100">
                <LazyPreview
                    v_id={v_id}
                    emailId={rawBook?.userEmail}
                    backendUrl={BACKEND_URL}
                    iframeBaseUrl={resolvedIframeBaseUrl}
                    title={bookName || "Flipbook"}
                    imageUrl={rawBook?.image || null}
                    firstPageFileName={firstPageFileName}
                    firstPageContent={firstPageContent}
                />
            </div>

            {/* Top Right Floating Action Buttons (Heart + Three-Dots) - Visible on hover */}
            <div
                className={`absolute top-[0.6vw] right-[0.6vw] flex flex-col items-center gap-[0.35vw] z-30 transition-opacity duration-200 ${isMenuOpen || isFavorited ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Heart Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(rawBook);
                    }}
                    className="w-[2vw] h-[2vw] min-w-[30px] min-h-[30px] rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-red-500 hover:scale-105 transition-all cursor-pointer focus:outline-none"
                    title={isFavorited ? "Favorited" : "Add to Favorites"}
                >
                    <Icon icon="lucide:heart" className={`w-[1vw] h-[1vw] min-w-[15px] min-h-[15px] transition-colors ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
                </button>

                {/* Three-Dot Button & Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="w-[2vw] h-[2vw] min-w-[30px] min-h-[30px] rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-black hover:scale-105 transition-all cursor-pointer focus:outline-none"
                        title="More Options"
                    >
                        <Icon icon="mdi:dots-vertical" className="w-[1.05vw] h-[1.05vw] min-w-[16px] min-h-[16px]" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-[110%] right-0 w-[9.5vw] min-w-[140px] bg-white rounded-[0.7vw] shadow-[0_10px_35px_rgba(0,0,0,0.15)] py-[0.6vh] z-50 border border-gray-100 flex flex-col">
                            {menuItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                        item.action(e);
                                    }}
                                    className="w-full flex items-center gap-[0.6vw] px-[0.8vw] py-[0.6vh] text-[0.78vw] font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors text-left cursor-pointer"
                                >
                                    <span className="flex items-center justify-center text-gray-700">{item.icon}</span>
                                    <span className="whitespace-nowrap">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Card Details (Enhanced Size & Compact Spacing) */}
            <div className="p-[1vw] flex flex-col flex-1 bg-white rounded-b-xl">
                {/* Stats (Split evenly across width) */}
                <div className="flex items-center justify-between w-full text-[0.76vw] text-gray-700 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-[0.25vw]">
                        <span className="text-black font-semibold">{(Array.isArray(pages) ? pages.length : (typeof pages === 'number' ? pages : 12))}</span>
                        <span className="font-normal text-gray-500">Pages</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-[0.25vw]">
                        <Icon icon="lucide:eye" className="w-[0.85vw] h-[0.85vw] text-gray-400" />
                        <span>{views || '12.5k'}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-[0.25vw]">
                        <Icon icon="material-symbols:star" className="w-[0.9vw] h-[0.9vw] text-yellow-400" />
                        <span>{rating || 4.5}</span>
                    </div>
                </div>

                {/* Book Title */}
                <h4 className="text-[0.98vw] font-semibold text-black truncate tracking-tight mt-[0.6vw]" title={bookName || 'Flipbook'}>
                    {bookName || 'Flipbook'}
                </h4>

                {/* Author Info & Action Button */}
                <div className="flex items-center justify-between mt-[0.6vw]">
                    <div
                        className="flex items-center gap-[0.55vw] min-w-0 pr-2 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onProfileClick && onProfileClick({ name: authorName, profileImg: resolvedAvatar, picture: resolvedAvatar, role: 'Creator', email: rawBook?.userEmail, emailId: rawBook?.userEmail, avatarBgColor: authorBgColor, location, v_id, shareId });
                        }}
                    >
                        {resolvedAvatar && !avatarError ? (
                            <img
                                src={resolvedAvatar}
                                alt={authorName || 'Creator'}
                                className="w-[2.1vw] h-[2.1vw] min-w-[32px] min-h-[32px] rounded-full border border-gray-200 object-cover shrink-0 hover:opacity-85 transition-opacity"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <div
                                className="w-[2.1vw] h-[2.1vw] min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center text-white text-[0.85vw] font-bold shrink-0 shadow-inner hover:opacity-85 transition-opacity"
                                style={{ backgroundColor: avatarColor }}
                            >
                                {(authorName || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 pr-1">
                            <span className="text-[0.88vw] font-semibold text-gray-900 leading-tight truncate hover:text-[#ea543a] transition-colors">
                                {authorName || 'Creator'}
                            </span>
                            <span className="flex items-center gap-[0.2vw] text-[0.68vw] text-gray-400 mt-0.5 truncate">
                                <Icon icon="lucide:map-pin" className="w-[0.75vw] h-[0.75vw] min-w-[10px] min-h-[10px] text-gray-400 shrink-0" />
                                <span className="truncate">{location ? String(location).replace(/📍/g, '').trim() : 'Coimbatore'}</span>
                            </span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBook();
                        }}
                        className="bg-[#ea543a] hover:bg-[#d9442a] text-white w-[2.1vw] h-[2.1vw] min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-md cursor-pointer flex-shrink-0"
                        title="View Book"
                    >
                        <Icon icon="mdi:arrow-top-right" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const FlipbookCardSkeleton = () => {
    return (
        <div className="bg-white border border-gray-100/80 rounded-xl overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative animate-pulse">
            <div className="relative w-full aspect-[4/3] bg-gray-200 rounded-t-xl"></div>
            <div className="p-[1vw] flex flex-col flex-1 bg-white rounded-b-xl">
                <div className="flex items-center justify-between w-full">
                    <div className="h-[0.76vw] bg-gray-200 rounded w-[4vw]"></div>
                    <div className="h-[0.76vw] bg-gray-200 rounded w-[3.5vw]"></div>
                    <div className="h-[0.76vw] bg-gray-200 rounded w-[3vw]"></div>
                </div>
                <div className="h-[0.98vw] bg-gray-200 rounded w-3/4 mt-[0.6vw]"></div>
                <div className="flex items-center justify-between mt-[0.6vw]">
                    <div className="flex items-center gap-[0.55vw]">
                        <div className="w-[2.1vw] h-[2.1vw] min-w-[32px] min-h-[32px] rounded-full bg-gray-200 shrink-0"></div>
                        <div className="flex flex-col gap-[0.2vw]">
                            <div className="h-[0.88vw] bg-gray-200 rounded w-[5vw]"></div>
                            <div className="h-[0.68vw] bg-gray-100 rounded w-[3.5vw]"></div>
                        </div>
                    </div>
                    <div className="w-[2.1vw] h-[2.1vw] min-w-[32px] min-h-[32px] rounded-full bg-gray-200 shrink-0"></div>
                </div>
            </div>
        </div>
    );
};

const CreatorCard = ({ index, creator, onProfileClick, onToggleFollow, isFollowingLoading, currentUserEmail }) => {
    const bannerStyle = {
        background: creator.bannerBg?.type === 'solid' ? creator.bannerBg?.value : undefined,
        backgroundImage: (creator.bannerBg?.type === 'gradient' || creator.bannerBg?.type === 'media')
            ? creator.bannerBg?.value
            : (creator.bannerBg?.value || defaultGradients[index % defaultGradients.length]),
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };
    const rawCreatorPic = (creator.picture && creator.picture !== 'color_only' && creator.picture !== 'null') ? creator.picture : null;
    const displayAvatar = rawCreatorPic
        ? (rawCreatorPic.startsWith('blob:') || rawCreatorPic.startsWith('data:') ? rawCreatorPic : resolveUploadsPath(rawCreatorPic))
        : null;
    const avatarColor = getAvatarColor(creator.name || creator.email, creator.avatarBgColor);
    const emailKey = (creator.emailId || creator.email || '').toLowerCase();
    const isSelf = emailKey && emailKey === currentUserEmail;

    return (
        <div className="bg-white border border-gray-100 rounded-[1vw] overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.06)] relative group">
            {/* Banner */}
            <div
                className="h-[14vh] w-full relative cursor-pointer"
                style={bannerStyle}
                onClick={() => onProfileClick(creator)}
            />

            {/* Overlapping Avatar & Follow Button */}
            <div className="px-[1.2vw] pb-[1.2vw] relative bg-white flex-1 flex flex-col">
                <div className="flex justify-between items-end -mt-[2.5vw] mb-[1vh]">
                    <div
                        className="relative shrink-0 z-10 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => onProfileClick(creator)}
                    >
                        <div className="w-[6vw] h-[6vw] rounded-full border-[0.25vw] border-white overflow-hidden bg-white relative z-10 flex items-center justify-center shadow-sm">
                            {displayAvatar ? (
                                <img src={displayAvatar} alt={creator.name} className="w-full h-full object-cover bg-gray-50" />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-white text-[2.2vw] font-bold"
                                    style={{ backgroundColor: avatarColor }}
                                >
                                    {creator.name ? creator.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        {/* Left Smooth Corner */}
                        <svg className="absolute top-[1.8vw] -left-[0.56vw] w-[0.8vw] h-[0.8vw] z-10" viewBox="0 0 10 10">
                            <path d="M0,10 L10,10 L10,0 A10,10 0 0,1 0,10 Z" fill="white" />
                        </svg>
                        {/* Right Smooth Corner */}
                        <svg className="absolute top-[1.8vw] -right-[0.56vw] w-[0.8vw] h-[0.8vw] z-10" viewBox="0 0 10 10">
                            <path d="M10,10 L0,10 L0,0 A10,10 0 0,0 10,10 Z" fill="white" />
                        </svg>
                    </div>

                    {!isSelf && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFollow(emailKey);
                            }}
                            disabled={isFollowingLoading}
                            className={`w-[5.2vw] h-[1.7vw] rounded-full text-[0.85vw] font-medium transition-colors z-10 mb-[1vw] cursor-pointer flex items-center justify-center gap-[0.3vw] ${
                                creator.isFollowing
                                    ? 'bg-white text-black border border-gray-200 shadow-inner hover:bg-gray-50'
                                    : 'bg-black text-white hover:bg-gray-800 shadow-sm'
                            }`}
                        >
                            {isFollowingLoading ? (
                                <Icon icon="line-md:loading-loop" className="w-[0.9vw] h-[0.9vw]" />
                            ) : creator.isFollowing ? (
                                <span>Unfollow</span>
                            ) : (
                                <span>Follow</span>
                            )}
                        </button>
                    )}
                </div>

                {/* Info */}
                <h4
                    className="text-[1vw] font-semibold text-gray-900 mt-[0.5vh] truncate cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => onProfileClick(creator)}
                >
                    {creator.name || 'Creator'}
                </h4>
                <p className="text-[0.7vw] text-gray-400 truncate">{creator.industryType || creator.companyName || 'Product Designer'}</p>
                <p className="text-[0.7vw] text-gray-500 mt-[1vh] leading-relaxed line-clamp-3 flex-1 font-normal">
                    {creator.about || '“Bring your content to life with a real, interactive experience”'}
                </p>

                {/* Divider */}
                <div className="w-full h-[1px] bg-gray-100 mt-[1.5vh] mb-[1vh]"></div>

                {/* Stats */}
                <div className="flex items-center justify-between px-[0.5vw]">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-[0.3vw] text-gray-800 font-semibold text-[0.85vw]">
                            <Icon icon="boxicons:book" className="w-[1.1vw] h-[1.1vw]" />
                            <span>{creator.totalBooks !== undefined && creator.totalBooks !== null ? creator.totalBooks : (creator.booksCount || 0)}</span>
                        </div>
                        <span className="text-[0.65vw] text-gray-400 mt-[0.2vh]">Total Books</span>
                    </div>
                    <div className="w-[1px] h-[2.5vh] bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-[0.3vw] text-gray-800 font-semibold text-[0.85vw]">
                            <Icon icon="lucide:user" className="w-[1vw] h-[1vw]" />
                            <span>{creator.followersCount !== undefined && creator.followersCount !== null ? creator.followersCount : (creator.followers?.length || 0)}</span>
                        </div>
                        <span className="text-[0.65vw] text-gray-400 mt-[0.2vh]">Followers</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Explore = () => {
    const [exploreMode, setExploreMode] = useState('books'); // 'books' | 'creators'
    const [booksData, setBooksData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();
    const [favoriteBookIds, setFavoriteBookIds] = useState([]);

    // Mobile/Tab Filter Drawer State
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Sidebar Filter States
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedPages, setSelectedPages] = useState([]);
    const [selectedPublishDates, setSelectedPublishDates] = useState([]);
    
    // Creator Sidebar Filter States
    const [industrySearch, setIndustrySearch] = useState('');
    const [selectedCreatorCategories, setSelectedCreatorCategories] = useState([]);
    const [selectedCreatorTypes, setSelectedCreatorTypes] = useState([]);
    const [selectedLocationCountry, setSelectedLocationCountry] = useState('All Countries');
    const [selectedLocationState, setSelectedLocationState] = useState('All States');
    const [selectedLocationCity, setSelectedLocationCity] = useState('All Cities');
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [selectedCreatorBooks, setSelectedCreatorBooks] = useState([]);
    const [selectedCreatorFollowers, setSelectedCreatorFollowers] = useState([]);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Most Popular');
    const [isFavoritesOnly, setIsFavoritesOnly] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);

    const [category, setCategory] = useState('All Category');
    const [showMoreCategories, setShowMoreCategories] = useState(false);
    const [showMoreTypes, setShowMoreTypes] = useState(false);
    const [showMoreIndustries, setShowMoreIndustries] = useState(false);
    const [showMoreRatings, setShowMoreRatings] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);
    const [maxPages, setMaxPages] = useState(100);

    const { user } = useAuth();
    const currentUserEmail = (user?.emailId || user?.email || '').toLowerCase();

    const [topCreators, setTopCreators] = useState([]);
    const [isCreatorsLoading, setIsCreatorsLoading] = useState(true);
    const [followingLoadingMap, setFollowingLoadingMap] = useState({});

    // Sidebar sticky scroll calculation (scroll filters completely first, then stick)
    const sidebarRef = useRef(null);
    const [sidebarStickyTop, setSidebarStickyTop] = useState(72);

    useEffect(() => {
        const handleClickOutsideSort = (e) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
                setIsSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideSort);
        return () => document.removeEventListener('mousedown', handleClickOutsideSort);
    }, []);

    useEffect(() => {
        const updateSidebarSticky = () => {
            if (!sidebarRef.current) return;
            const vh = window.innerHeight;
            const topBarHeight = 72;
            const sidebarHeight = sidebarRef.current.offsetHeight;
            const availableHeight = vh - topBarHeight;

            if (sidebarHeight <= availableHeight) {
                setSidebarStickyTop(topBarHeight + 10);
            } else {
                // If sidebar is taller than viewport, stick once its bottom is completely scrolled into view
                setSidebarStickyTop(vh - sidebarHeight - 20);
            }
        };

        updateSidebarSticky();
        window.addEventListener('resize', updateSidebarSticky);
        return () => window.removeEventListener('resize', updateSidebarSticky);
    }, [exploreMode, showMoreCategories, showMoreTypes, showMoreIndustries]);

    useEffect(() => {
        if (!currentUserEmail) return;

        const fetchFavBooks = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
                const res = await axios.get(`${backendUrl}/api/flipbook/list?emailId=${encodeURIComponent(currentUserEmail)}`, { withCredentials: true });
                if (res.data && res.data.books) {
                    const favIds = res.data.books.filter(b => b.isFavorite).map(b => b.v_id);
                    setFavoriteBookIds(favIds);
                }
            } catch (err) {
                console.error("Error fetching favorite books:", err);
            }
        };

        fetchFavBooks();
    }, [currentUserEmail]);

    const handleToggleFollow = async (targetEmail) => {
        if (!currentUserEmail) {
            toast.error("Please log in to follow creators.");
            return;
        }
        if (!targetEmail) return;

        const normTarget = targetEmail.trim().toLowerCase();
        if (normTarget === currentUserEmail) return;

        const prevCreators = [...topCreators];
        const targetCreator = topCreators.find(c => (c.emailId || c.email)?.toLowerCase() === normTarget);
        const wasFollowing = targetCreator?.isFollowing || false;

        setTopCreators(prev => prev.map(c => {
            if ((c.emailId || c.email)?.toLowerCase() === normTarget) {
                const newCount = wasFollowing ? Math.max(0, (c.followersCount || 1) - 1) : (c.followersCount || 0) + 1;
                return {
                    ...c,
                    isFollowing: !wasFollowing,
                    followersCount: newCount
                };
            }
            return c;
        }));

        setFollowingLoadingMap(prev => ({ ...prev, [normTarget]: true }));

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
            const res = await axios.post(`${backendUrl}/api/explore/toggle-follow`, {
                currentEmail: currentUserEmail,
                targetEmail: normTarget
            });

            if (res.data?.success) {
                setTopCreators(prev => prev.map(c => {
                    if ((c.emailId || c.email)?.toLowerCase() === normTarget) {
                        return {
                            ...c,
                            isFollowing: res.data.isFollowing,
                            followersCount: res.data.followersCount,
                            followers: res.data.followers
                        };
                    }
                    return c;
                }));
            } else {
                setTopCreators(prevCreators);
            }
        } catch (err) {
            console.error("Error toggling follow status:", err);
            setTopCreators(prevCreators);
        } finally {
            setFollowingLoadingMap(prev => ({ ...prev, [normTarget]: false }));
        }
    };

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedBookForModal, setSelectedBookForModal] = useState(null);

    const navigate = useNavigate();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedCreator, setSelectedCreator] = useState(null);

    const handleProfileClick = (creator) => {
        setSelectedCreator(creator);
        setIsProfileModalOpen(true);
    };

    const handleOpenShareModal = (rawBook) => {
        setSelectedBookForModal(rawBook);
        setIsShareModalOpen(true);
    };

    const handleOpenExportModal = (rawBook) => {
        setSelectedBookForModal(rawBook);
        setIsExportModalOpen(true);
    };

    const handleToggleFavorite = async (rawBook) => {
        if (!currentUserEmail) {
            toast.error("Please log in to add books to your favorites.");
            return;
        }
        const targetVId = rawBook?.v_id || rawBook?.book_v_id || rawBook?.vId;
        if (!targetVId) {
            toast.error("Flipbook identifier missing.");
            return;
        }
        const authorEmail = (rawBook?.userEmail || rawBook?.emailId || '').trim().toLowerCase();
        const isOwner = Boolean(
            authorEmail && currentUserEmail && authorEmail === currentUserEmail
        );
        if (isOwner) {
            toast.error("You cannot favorite your own book.");
            return;
        }
        const isFav = favoriteBookIds.includes(targetVId);
        const next = !isFav;
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

        try {
            if (next) {
                setFavoriteBookIds(prev => [...prev, targetVId]);
            } else {
                setFavoriteBookIds(prev => prev.filter(id => id !== targetVId));
            }
            const res = await axios.post(`${backendUrl}/api/flipbook/favorite`, {
                emailId: currentUserEmail,
                v_id: targetVId,
                isFavorite: next
            }, { withCredentials: true });
            if (res.data?.success) {
                toast.success(next ? "Book added to your Favorites!" : "Book removed from your Favorites.");
            } else {
                setFavoriteBookIds(prev => next ? prev.filter(id => id !== targetVId) : [...prev, targetVId]);
                toast.error(res.data?.message || "Failed to update favorites");
            }
        } catch (err) {
            setFavoriteBookIds(prev => next ? prev.filter(id => id !== targetVId) : [...prev, targetVId]);
            toast.error(err.response?.data?.message || "Error updating favorites");
        }
    };

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

        const fetchPublishedBooks = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${backendUrl}/api/explore/published`);

                if (response.data && response.data.books) {
                    const formattedBooks = response.data.books.map(book => {
                        let rawOrient = (book.orientation || book.Customized_Settings?.FlipbookInfo?.orientation || '').toLowerCase();
                        if (rawOrient.includes('horizontal') || rawOrient.includes('landscape') || book.isLandscape) {
                            rawOrient = 'landscape';
                        } else if (rawOrient.includes('square')) {
                            rawOrient = 'square';
                        } else if (rawOrient.includes('vertical') || rawOrient.includes('portrait')) {
                            rawOrient = 'portrait';
                        } else {
                            const w = book.Customized_Settings?.FlipbookInfo?.width || book.width || book.pageWidth;
                            const h = book.Customized_Settings?.FlipbookInfo?.height || book.height || book.pageHeight;
                            if (w && h) {
                                rawOrient = Number(w) > Number(h) ? 'landscape' : Number(w) < Number(h) ? 'portrait' : 'square';
                            } else {
                                rawOrient = 'portrait';
                            }
                        }

                        let typeName = 'Portrait';
                        if (rawOrient === 'landscape') typeName = 'Landscape';
                        else if (rawOrient === 'square') typeName = 'Square';
                        else typeName = 'Portrait';

                        const has3D = Boolean(
                            book.has3D || 
                            book.is3D || 
                            book.has3DModels || 
                            (book.Customized_Settings?.InteractionThreedModel && Object.keys(book.Customized_Settings.InteractionThreedModel).length > 0)
                        );

                        const vis = book.Customized_Settings?.Visibility || book.Visibility || {};
                        const shareId = vis.shareId || book.v_id;
                        const access = (vis.access || 'public').toLowerCase();

                        return {
                            rawBook: book,
                            v_id: book.v_id,
                            shareId: shareId,
                            access: access,
                            userEmail: book.userEmail,
                            bookName: book.flipbookName,
                            authorName: book.authorName || (book.userEmail ? book.userEmail.split('@')[0] : "Creator"),
                            location: book.city || book.location || "Coimbatore",
                            authorPicture: book.authorPicture || null,
                            authorBgColor: book.authorBgColor || '#E8D4C8',
                            pages: typeof book.pages === 'number' ? book.pages : (book.pages?.length || book.pageCount || 12),
                            views: book.views || book.analytics?.views || "12.5k",
                            rating: book.rating || 4.5,
                            description: book.Customized_Settings?.FlipbookInfo?.quotes,
                            type: typeName,
                            has3D: has3D,
                            is3D: has3D,
                            category: book.Customized_Settings?.FlipbookInfo?.category || book.category || "Catalog"
                        };
                    }).filter(book => book.access === 'public');

                    setBooksData(formattedBooks);
                }
            } catch (err) {
                console.error("Error fetching data from backend API:", err);
                setError("Failed to load flipbooks from server.");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchTopCreators = async () => {
            try {
                setIsCreatorsLoading(true);
                const params = {};
                if (currentUserEmail) params.excludeEmail = currentUserEmail;

                const res = await axios.get(`${backendUrl}/api/explore/top-creators`, { params });
                if (res.data && res.data.creators) {
                    setTopCreators(res.data.creators);
                }
            } catch (err) {
                console.error("Error fetching top creators from backend API:", err);
            } finally {
                setIsCreatorsLoading(false);
            }
        };

        fetchPublishedBooks();
        fetchTopCreators();
    }, [currentUserEmail]);

    // Filter booksData based on active selections
    const filteredBooks = booksData.filter(book => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim();
            const bName = (book.bookName || '').toLowerCase();
            const aName = (book.authorName || '').toLowerCase();
            if (!bName.includes(q) && !aName.includes(q)) return false;
        }

        if (isFavoritesOnly && !favoriteBookIds.includes(book.v_id)) {
            return false;
        }

        if (selectedTypes.length > 0) {
            const isTypeMatched = selectedTypes.some(typeOpt => {
                if (!typeOpt) return false;
                if (typeOpt === "3D Added Flipbook") {
                    return Boolean(book.has3D || book.is3D);
                }
                return (book.type || '').toLowerCase().trim() === typeOpt.toLowerCase().trim();
            });
            if (!isTypeMatched) return false;
        }

        if (selectedCategories.length > 0) {
            const isCatMatched = selectedCategories.some(catOpt => {
                if (!catOpt) return false;
                const normCat = catOpt.toLowerCase().trim();
                const bookCat = (book.category || '').toLowerCase().trim();
                if (normCat.includes('photograph') && bookCat.includes('photo')) return true;
                if (normCat === 'catalog' && (bookCat === 'catalog' || bookCat === 'product catalog' || bookCat === 'catalogue')) return true;
                if (normCat === 'product catalog' && (bookCat === 'catalog' || bookCat === 'product catalog' || bookCat === 'catalogue')) return true;
                return bookCat === normCat;
            });
            if (!isCatMatched) return false;
        }

        const effectivePages = selectedPages.filter(p => p !== 'All');
        if (effectivePages.length > 0) {
            const bookPages = Number(book.pages || 1);
            const isPageMatched = effectivePages.some(pageOpt => {
                if (pageOpt === '1 - 8 Pages') return bookPages >= 1 && bookPages <= 8;
                if (pageOpt === '8 - 16 Pages') return bookPages > 8 && bookPages <= 16;
                if (pageOpt === '16 - 24 Pages') return bookPages > 16 && bookPages <= 24;
                if (pageOpt === '24 - MAX Pages') return bookPages > 24;
                return true;
            });
            if (!isPageMatched) return false;
        }

        const effectiveDates = selectedPublishDates.filter(d => d !== 'All Time');
        if (effectiveDates.length > 0) {
            const rawDate = book.rawBook?.createdAt || book.rawBook?.updatedAt;
            if (rawDate) {
                const created = new Date(rawDate);
                const now = new Date();
                const diffDays = (now - created) / (1000 * 60 * 60 * 24);
                const isDateMatched = effectiveDates.some(dateOpt => {
                    if (dateOpt === 'Today') return diffDays <= 1;
                    if (dateOpt === 'Before 3 days') return diffDays <= 3;
                    if (dateOpt === 'This Week') return diffDays <= 7;
                    if (dateOpt === 'This Month') return diffDays <= 30;
                    if (dateOpt === 'This Year') return diffDays <= 365;
                    return true;
                });
                if (!isDateMatched) return false;
            }
        }

        if (category && category !== 'All Category') {
            const catLower = category.toLowerCase();
            const bookCat = (book.category || '').toLowerCase();
            if (catLower.includes('photograph')) {
                if (!bookCat.includes('photo')) return false;
            } else if (bookCat !== catLower) {
                return false;
            }
        }

        return true;
    });

    // Sort booksData
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        if (sortBy === 'Newest') {
            const dateA = new Date(a.rawBook?.createdAt || a.rawBook?.updatedAt || 0).getTime();
            const dateB = new Date(b.rawBook?.createdAt || b.rawBook?.updatedAt || 0).getTime();
            return dateB - dateA;
        }
        if (sortBy === 'Top Rated') {
            return (b.rating || 0) - (a.rating || 0);
        }
        const parseViews = (v) => {
            if (typeof v === 'number') return v;
            if (typeof v === 'string') {
                const lower = v.toLowerCase().trim();
                if (lower.endsWith('k')) return parseFloat(lower) * 1000;
                if (lower.endsWith('m')) return parseFloat(lower) * 1000000;
                return parseFloat(lower) || 0;
            }
            return 0;
        };
        return parseViews(b.views) - parseViews(a.views);
    });

    // Dynamic Filter Count Helpers for Books
    const getCategoryCount = (item) => {
        const norm = item.toLowerCase().trim();
        return booksData.filter(b => {
            const cat = (b.category || '').toLowerCase().trim();
            if (norm.includes('photograph') && cat.includes('photo')) return true;
            if (norm === 'catalog' && (cat === 'catalog' || cat === 'product catalog' || cat === 'catalogue')) return true;
            if (norm === 'product catalog' && (cat === 'catalog' || cat === 'product catalog' || cat === 'catalogue')) return true;
            return cat === norm;
        }).length;
    };

    const getTypeCount = (item) => {
        if (item === "3D Added Flipbook") {
            return booksData.filter(b => b.has3D || b.is3D).length;
        }
        const norm = item.toLowerCase().trim();
        return booksData.filter(b => (b.type || '').toLowerCase().trim() === norm).length;
    };

    const getPageCount = (item) => {
        if (item === 'All') return booksData.length;
        if (item === '1 - 8 Pages') return booksData.filter(b => b.pages >= 1 && b.pages <= 8).length;
        if (item === '8 - 16 Pages') return booksData.filter(b => b.pages > 8 && b.pages <= 16).length;
        if (item === '16 - 24 Pages') return booksData.filter(b => b.pages > 16 && b.pages <= 24).length;
        if (item === '24 - MAX Pages') return booksData.filter(b => b.pages > 24).length;
        return booksData.length;
    };

    const getPublishDateCount = (item) => {
        if (item === 'All Time') return booksData.length;
        const now = new Date();
        return booksData.filter(b => {
            if (!b.rawBook?.createdAt) return true;
            const created = new Date(b.rawBook.createdAt);
            const diffDays = (now - created) / (1000 * 60 * 60 * 24);
            if (item === 'Today') return diffDays <= 1;
            if (item === 'Before 3 days') return diffDays <= 3;
            if (item === 'This Week') return diffDays <= 7;
            if (item === 'This Month') return diffDays <= 30;
            if (item === 'This Year') return diffDays <= 365;
            return true;
        }).length;
    };

    const getIndustryCount = (item) => {
        const norm = item.toLowerCase();
        return topCreators.filter(c => {
            const ind = (c.industryType || c.companyName || 'Manufacturing').toLowerCase();
            return ind.includes(norm);
        }).length;
    };

    const getCreatorTypeCount = (item) => {
        const norm = item.toLowerCase();
        return topCreators.filter(c => {
            const role = (c.role || c.creatorType || 'Individual').toLowerCase();
            return role.includes(norm);
        }).length;
    };

    const getSpecializationCount = (item) => {
        const norm = item.toLowerCase().split(' ')[0];
        return topCreators.filter(c => {
            const spec = (c.specialization || c.industryType || 'Product Catalogues').toLowerCase();
            return spec.includes(norm);
        }).length;
    };

    const getCreatorCategoryCount = (item) => {
        if (item === 'All') return topCreators.length;
        const norm = item.toLowerCase().split(' ')[0];
        return topCreators.filter(c => {
            const ind = (c.industryType || c.companyName || 'Product Designer').toLowerCase();
            return ind.includes(norm);
        }).length;
    };

    const getCreatorBooksFilterCount = (item) => {
        if (item === 'All') return topCreators.length;
        return topCreators.filter(c => {
            const bCount = c.totalBooks !== undefined ? c.totalBooks : (c.booksCount || 0);
            if (item === '1 - 5 Books') return bCount >= 1 && bCount <= 5;
            if (item === '5 - 10 Books') return bCount > 5 && bCount <= 10;
            if (item === '10+ Books') return bCount > 10;
            return true;
        }).length;
    };

    const getCreatorFollowersFilterCount = (item) => {
        if (item === 'All') return topCreators.length;
        return topCreators.filter(c => {
            const fCount = c.followersCount !== undefined ? c.followersCount : (c.followers?.length || 0);
            if (item === '1 - 50 Followers') return fCount >= 1 && fCount <= 50;
            if (item === '50 - 200 Followers') return fCount > 50 && fCount <= 200;
            if (item === '200+ Followers') return fCount > 200;
            return true;
        }).length;
    };

    const filteredCreators = topCreators.filter(creator => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const nameMatch = creator.name?.toLowerCase().includes(q);
            const emailMatch = (creator.emailId || creator.email)?.toLowerCase().includes(q);
            const companyMatch = creator.companyName?.toLowerCase().includes(q);
            const industryMatch = creator.industryType?.toLowerCase().includes(q);
            if (!nameMatch && !emailMatch && !companyMatch && !industryMatch) return false;
        }

        if (selectedCreatorCategories.length > 0 && !selectedCreatorCategories.includes('All')) {
            const ind = (creator.industryType || creator.companyName || 'Manufacturing').toLowerCase();
            const isMatch = selectedCreatorCategories.some(cat => ind.includes(cat.toLowerCase().split(' ')[0]));
            if (!isMatch) return false;
        }

        if (selectedCreatorTypes.length > 0) {
            const role = (creator.role || creator.creatorType || 'Individual').toLowerCase();
            const isMatch = selectedCreatorTypes.some(type => role.includes(type.toLowerCase().split(' ')[0]));
            if (!isMatch) return false;
        }

        if (selectedSpecializations.length > 0) {
            const spec = (creator.specialization || creator.industryType || 'Product Catalogues').toLowerCase();
            const isMatch = selectedSpecializations.some(s => spec.includes(s.toLowerCase().split(' ')[0]));
            if (!isMatch) return false;
        }

        if (selectedCreatorBooks.length > 0 && !selectedCreatorBooks.includes('All')) {
            const bCount = creator.totalBooks !== undefined ? creator.totalBooks : (creator.booksCount || 0);
            const isMatch = selectedCreatorBooks.some(range => {
                if (range === '1 - 5 Books') return bCount >= 1 && bCount <= 5;
                if (range === '5 - 10 Books') return bCount > 5 && bCount <= 10;
                if (range === '10+ Books') return bCount > 10;
                return true;
            });
            if (!isMatch) return false;
        }

        if (selectedCreatorFollowers.length > 0 && !selectedCreatorFollowers.includes('All')) {
            const fCount = creator.followersCount !== undefined ? creator.followersCount : (creator.followers?.length || 0);
            const isMatch = selectedCreatorFollowers.some(range => {
                if (range === '1 - 50 Followers') return fCount >= 1 && fCount <= 50;
                if (range === '50 - 200 Followers') return fCount > 50 && fCount <= 200;
                if (range === '200+ Followers') return fCount > 200;
                return true;
            });
            if (!isMatch) return false;
        }

        return true;
    });

    const handleResetAll = () => {
        setSelectedCategories([]);
        setSelectedTypes([]);
        setSelectedPages([]);
        setSelectedPublishDates([]);
        setSelectedRating(null);
        setMaxPages(100);
        setIndustrySearch('');
        setSelectedCreatorCategories([]);
        setSelectedCreatorTypes([]);
        setSelectedLocationCountry('All Countries');
        setSelectedLocationState('All States');
        setSelectedLocationCity('All Cities');
        setSelectedSpecializations([]);
        setSelectedCreatorBooks([]);
        setSelectedCreatorFollowers([]);
        setSearchQuery('');
        setCategory('All Category');
        setIsFavoritesOnly(false);
        setSortBy('Most Popular');
    };

    const removeChip = (type, val) => {
        if (type === 'type') setSelectedTypes(prev => prev.filter(t => t !== val));
        if (type === 'cat') setSelectedCategories(prev => prev.filter(c => c !== val));
        if (type === 'page') setSelectedPages(prev => prev.filter(p => p !== val));
        if (type === 'date') setSelectedPublishDates(prev => prev.filter(d => d !== val));
        if (type === 'creatorCat') setSelectedCreatorCategories(prev => prev.filter(c => c !== val));
        if (type === 'creatorType') setSelectedCreatorTypes(prev => prev.filter(t => t !== val));
        if (type === 'specialization') setSelectedSpecializations(prev => prev.filter(s => s !== val));
        if (type === 'creatorBook') setSelectedCreatorBooks(prev => prev.filter(b => b !== val));
        if (type === 'creatorFollower') setSelectedCreatorFollowers(prev => prev.filter(f => f !== val));
    };

    return (
        <div className="w-full bg-white text-slate-900 font-sans min-h-screen flex flex-col justify-between">
            <style>{`
                input[type="range"].custom-range-slider { 
                    -webkit-appearance: none; 
                    width: 100%; 
                    background: transparent; 
                    position: relative; 
                    outline: none;
                }
                input[type="range"].custom-range-slider::before { 
                    content: ""; 
                    position: absolute; 
                    top: -0.75vw; 
                    bottom: -0.75vw; 
                    left: 0; 
                    right: 0; 
                    cursor: pointer; 
                    z-index: 1; 
                }
                input[type="range"].custom-range-slider::-webkit-slider-runnable-track { 
                    height: 0.3vw; 
                    border-radius: 0.15vw; 
                    background: inherit; 
                }
                input[type="range"].custom-range-slider::-webkit-slider-thumb { 
                    -webkit-appearance: none !important; 
                    height: 1vw !important; 
                    width: 1vw !important; 
                    border-radius: 50% !important; 
                    background: #4D47FF !important; 
                    border: 0.1vw solid #ffffff !important; 
                    box-shadow: 0 0.15vw 0.5vw rgba(77,71,255,0.4) !important; 
                    margin-top: -0.35vw !important; 
                    cursor: pointer !important; 
                    transition: box-shadow 0.15s ease !important; 
                    position: relative; 
                    z-index: 2; 
                }
                input[type="range"].custom-range-slider::-webkit-slider-thumb:hover { 
                    box-shadow: 0 0.15vw 0.75vw rgba(77,71,255,0.6) !important; 
                }
            `}</style>

            
            {/* ------------------------------------------------------------- */}
            {/* ORIGINAL HERO SECTION BANNER (UNTOUCHED) */}
            {/* ------------------------------------------------------------- */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full bg-[#f5f5f5] border-b border-gray-100 px-[5vw]"
            >
                <div className="max-w-[85vw] mx-auto flex flex-col md:flex-row items-center justify-between gap-[3vw]">
                    {/* Left Text Block */}
                    <div className="max-w-[44vw] space-y-[1.8vh]">
                        <h1 className="text-[3.2vw] text-gray-900 font-normal tracking-tight leading-tight">
                            Explore FlipiBook
                        </h1>

                        <p className="text-[0.9vw] text-gray-600 font-normal leading-relaxed">
                            Discover immersive digital catalogues created by businesses, designers, and creators worldwide. Explore interactive flipbooks enhanced with 3D models, hotspots, videos, animations, and rich multimedia experiences.
                        </p>

                        <div className="w-[7vw] h-[0.3vh] min-h-[2px] bg-gray-800 rounded-full mt-[1.8vh]"></div>
                    </div>

                    {/* Right Hero Graphic */}
                    <div className="relative flex justify-center md:justify-end self-end">
                        <img
                            src={exploreHeroImg}
                            alt="Explore FlipiBook Hero Graphic"
                            className="h-[35vh] max-h-[400px] w-auto object-contain object-bottom shrink-0 block"
                        />
                    </div>
                </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* MAIN SEPARATE TWO-COLUMN LAYOUT: SIDEBAR & RIGHT CONTENT */}
            {/* ------------------------------------------------------------- */}
            {/* MOBILE & TABLET FILTER SLIDE-OVER DRAWER MODAL */}
            {isFilterDrawerOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsFilterDrawerOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl p-5 overflow-y-auto flex flex-col justify-between z-10 space-y-6">
                        <div>
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                                <div className="flex items-center gap-2">
                                    <Icon icon="fluent:filter-28-filled" className="w-5 h-5 text-slate-900" />
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {exploreMode === 'creators' ? 'Filter Creators' : 'Filter Books'}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterDrawerOpen(false)}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <Icon icon="lucide:x" className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Filters (Reused sidebar filter list) */}
                            {exploreMode === 'creators' ? (
                                <div className="space-y-5">
                                    {/* 1. Creator Category */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Icon icon="iconamoon:category" className="w-4 h-4 text-slate-700" />
                                            <span>Creator Category</span>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            {[
                                                'All',
                                                'Product Designer',
                                                'Graphic Designer',
                                                'Business / Brand',
                                                'Photographer',
                                                'Agency / Studio'
                                            ].map((item, idx) => (
                                                <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center gap-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCreatorCategories.includes(item)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedCreatorCategories([...selectedCreatorCategories, item]);
                                                                else setSelectedCreatorCategories(selectedCreatorCategories.filter(c => c !== item));
                                                            }}
                                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px] border-[1.5px] border-black rounded-[3px] checked:bg-[#5551ff] checked:border-[#5551ff] cursor-pointer transition-colors"
                                                        />
                                                        <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900">{item}</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 min-w-[24px] text-center">
                                                        {getCreatorCategoryCount(item)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Total Books Created */}
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Icon icon="fluent:document-one-page-multiple-20-regular" className="w-4 h-4 text-slate-700" />
                                            <span>Books Created</span>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            {[
                                                'All',
                                                '1 - 5 Books',
                                                '5 - 10 Books',
                                                '10+ Books'
                                            ].map((item, idx) => (
                                                <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center gap-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCreatorBooks.includes(item)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedCreatorBooks([...selectedCreatorBooks, item]);
                                                                else setSelectedCreatorBooks(selectedCreatorBooks.filter(b => b !== item));
                                                            }}
                                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px] border-[1.5px] border-black rounded-[3px] checked:bg-[#5551ff] checked:border-[#5551ff] cursor-pointer transition-colors"
                                                        />
                                                        <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900">{item}</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 min-w-[24px] text-center">
                                                        {getCreatorBooksFilterCount(item)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Followers Range */}
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Icon icon="fa6-regular:user" className="w-4 h-4 text-slate-700" />
                                            <span>Followers Range</span>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            {[
                                                'All',
                                                '1 - 50 Followers',
                                                '50 - 200 Followers',
                                                '200+ Followers'
                                            ].map((item, idx) => (
                                                <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center gap-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCreatorFollowers.includes(item)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedCreatorFollowers([...selectedCreatorFollowers, item]);
                                                                else setSelectedCreatorFollowers(selectedCreatorFollowers.filter(f => f !== item));
                                                            }}
                                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px] border-[1.5px] border-black rounded-[3px] checked:bg-[#5551ff] checked:border-[#5551ff] cursor-pointer transition-colors"
                                                        />
                                                        <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900">{item}</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 min-w-[24px] text-center">
                                                        {getCreatorFollowersFilterCount(item)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* 1. Category */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Icon icon="iconamoon:category" className="w-4 h-4 text-slate-700" />
                                            <span>Category</span>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            {[
                                                'Brochure',
                                                'Catalog',
                                                'Magazine',
                                                'Portfolio',
                                                'Storybook',
                                                'Photographs Book'
                                            ].map((item, idx) => (
                                                <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center gap-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(item)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedCategories([...selectedCategories, item]);
                                                                else setSelectedCategories(selectedCategories.filter(c => c !== item));
                                                            }}
                                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px] border-[1.5px] border-black rounded-[3px] checked:bg-[#5551ff] checked:border-[#5551ff] cursor-pointer transition-colors"
                                                        />
                                                        <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900">{item}</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 min-w-[24px] text-center">
                                                        {getCategoryCount(item)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Flipbook Type */}
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Icon icon="fluent-emoji-high-contrast:page-facing-up" className="w-4 h-4 text-slate-700" />
                                            <span>Flipbook Type</span>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            {[
                                                'Landscape',
                                                'Portrait',
                                                'Square',
                                                '3D Added Flipbook'
                                            ].map((item, idx) => (
                                                <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center gap-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTypes.includes(item)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedTypes([...selectedTypes, item]);
                                                                else setSelectedTypes(selectedTypes.filter(t => t !== item));
                                                            }}
                                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px] border-[1.5px] border-black rounded-[3px] checked:bg-[#5551ff] checked:border-[#5551ff] cursor-pointer transition-colors"
                                                        />
                                                        <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900">{item}</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 min-w-[24px] text-center">
                                                        {getTypeCount(item)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Pages */}
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Icon icon="fluent:document-one-page-multiple-20-regular" className="w-4 h-4 text-slate-700" />
                                            <span>Pages</span>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            {[
                                                'All',
                                                '1 - 8 Pages',
                                                '8 - 16 Pages',
                                                '16 - 24 Pages',
                                                '24 - MAX Pages'
                                            ].map((item, idx) => (
                                                <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center gap-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPages.includes(item)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    if (item === 'All') setSelectedPages(['All']);
                                                                    else setSelectedPages(prev => [...prev.filter(p => p !== 'All'), item]);
                                                                } else {
                                                                    setSelectedPages(selectedPages.filter(p => p !== item));
                                                                }
                                                            }}
                                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px] border-[1.5px] border-black rounded-[3px] checked:bg-[#5551ff] checked:border-[#5551ff] cursor-pointer transition-colors"
                                                        />
                                                        <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900">{item}</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 min-w-[24px] text-center">
                                                        {getPageCount(item)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 4. Publish Date */}
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Icon icon="uiw:date" className="w-4 h-4 text-slate-700" />
                                            <span>Publish Date</span>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            {[
                                                'All Time',
                                                'Today',
                                                'Before 3 days',
                                                'This Week',
                                                'This Month',
                                                'This Year'
                                            ].map((item, idx) => (
                                                <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center gap-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPublishDates.includes(item)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    if (item === 'All Time') setSelectedPublishDates(['All Time']);
                                                                    else setSelectedPublishDates(prev => [...prev.filter(d => d !== 'All Time'), item]);
                                                                } else {
                                                                    setSelectedPublishDates(selectedPublishDates.filter(d => d !== item));
                                                                }
                                                            }}
                                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px] border-[1.5px] border-black rounded-[3px] checked:bg-[#5551ff] checked:border-[#5551ff] cursor-pointer transition-colors"
                                                        />
                                                        <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900">{item}</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 min-w-[24px] text-center">
                                                        {getPublishDateCount(item)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Bottom Actions */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleResetAll}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#ea7233] bg-[#fff5f3] hover:bg-[#ffece8] transition-colors cursor-pointer"
                            >
                                <span>Reset All</span>
                                <Icon icon="lucide:trash-2" className="w-3.5 h-3.5 text-[#ea7233]" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFilterDrawerOpen(false)}
                                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#ea7233] hover:bg-[#d65a1c] transition-colors shadow-xs"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MAIN SEPARATE TWO-COLUMN LAYOUT: SIDEBAR & RIGHT CONTENT */}
            {/* ------------------------------------------------------------- */}
            <div className="w-full flex-1 px-[2vw] md:px-[2vw] py-[2vh] space-y-[3vh]">

                {/* Top Control Bar (Styled exactly like FlipbooksToolbar.jsx) */}
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md py-[1.2vh] px-[2vw] -mx-[2vw] flex flex-col md:flex-row justify-between items-center gap-[1.5vw] border-b border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
                    {/* Left: Explore by Toggle */}
                    <div className="flex flex-wrap items-center gap-[1vw] w-full md:w-auto">
                        {/* Mobile Filter Hamburger Button */}
                        <button
                            type="button"
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className="flex lg:hidden items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer"
                        >
                            <Icon icon="flowbite:filter-outline" className="w-[0.9vw] h-[0.9vw] text-[#ec5137]" />
                            <span>Filters</span>
                        </button>

                        <h2 className="text-[1.25vw] font-bold text-[#1f2937] tracking-tight whitespace-nowrap">
                            Explore by :
                        </h2>

                        {/* Books / Creators Toggle Pill */}
                        <div className="flex items-center bg-[#f3f4f6] p-[0.2vw] rounded-[0.6vw] border border-gray-200 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => setExploreMode('books')}
                                className={`px-[1.1vw] py-[0.38vw] rounded-[0.45vw] text-[0.84vw] font-semibold transition-all duration-200 cursor-pointer ${
                                    exploreMode === 'books'
                                        ? 'bg-black text-white shadow-xs'
                                        : 'text-gray-500 hover:text-black'
                                }`}
                            >
                                Books
                            </button>
                            <button
                                type="button"
                                onClick={() => setExploreMode('creators')}
                                className={`px-[1.1vw] py-[0.38vw] rounded-[0.45vw] text-[0.84vw] font-semibold transition-all duration-200 cursor-pointer ${
                                    exploreMode === 'creators'
                                        ? 'bg-black text-white shadow-xs'
                                        : 'text-gray-500 hover:text-black'
                                }`}
                            >
                                Creators
                            </button>
                        </div>
                    </div>

                    {/* Right: Search Bar, Sort By & Favorites (Matching FlipbooksToolbar.jsx) */}
                    <div className="flex items-center gap-[0.75vw] w-full md:w-auto">
                        {/* Search Input Bar */}
                        <div className="relative w-full md:w-[16vw]">
                            <Search className="absolute left-[0.9vw] top-1/2 -translate-y-1/2 text-[#ec5137]" size="0.95vw" />
                            <input
                                type="text"
                                placeholder={exploreMode === 'books' ? "Search Flipbook..." : "Search Creator..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-[2.4vw] pr-[1vw] py-[0.5vw] rounded-[0.6vw] border border-gray-200 text-[0.84vw] focus:outline-none focus:border-[#ec5137] focus:ring-1 focus:ring-[#ec5137] bg-white text-gray-700 placeholder-gray-400 shadow-sm transition-colors"
                            />
                        </div>

                        {/* Sort by Dropdown */}
                        <div className="relative" ref={sortDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer"
                            >
                                <ArrowDownUp size="0.9vw" className="text-[#ec5137]" />
                                <span>Sort by - <span className="text-gray-500 font-normal">{sortBy}</span></span>
                                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
                            </button>

                            {isSortDropdownOpen && (
                                <div className="absolute top-full right-0 mt-[0.25vw] min-w-[12vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 overflow-hidden py-[0.2vw]">
                                    {['Most Popular', 'Newest', 'Top Rated'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => { setSortBy(opt); setIsSortDropdownOpen(false); }}
                                            className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer ${
                                                sortBy === opt
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

                        {/* Favorites Tab Button */}
                        <button
                            type="button"
                            onClick={() => setIsFavoritesOnly(!isFavoritesOnly)}
                            className={`flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] border rounded-[0.6vw] text-[0.84vw] font-medium shadow-sm cursor-pointer transition-colors ${
                                isFavoritesOnly
                                    ? 'bg-[#fff5f3] border-[#ec5137] text-[#ec5137]'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Icon icon="fa6-solid:heart" className="w-[0.9vw] h-[0.9vw] text-[#ec5137]" />
                            <span>Favorites</span>
                        </button>
                    </div>
                </div>

                {/* Main Two-Column Layout Grid */}
                <div className="flex flex-col lg:flex-row gap-[2vw] items-start">
                
                {/* LEFT SIDEBAR FILTER PANEL (Desktop visible, Mobile/Tablet toggleable) */}
                <aside
                    ref={sidebarRef}
                    style={{ position: 'sticky', top: `${sidebarStickyTop}px` }}
                    className="hidden lg:block w-full lg:w-[16vw] shrink-0 space-y-[1.5vh] transition-[top] duration-150 self-start"
                >
                    
                    {/* Title */}
                    <div className="flex items-center justify-between px-[0.5vw]">
                        <div className="flex items-center gap-[0.5vw]">
                            <Icon icon={exploreMode === 'books' ? "flowbite:filter-outline" : "lucide:menu"} className="w-[1.2vw] h-[1.2vw] text-black" />
                            <span className="font-bold text-[1.1vw] text-black">
                                {exploreMode === 'books' ? 'Filter Books By' : 'Filter Creators'}
                            </span>
                        </div>
                        {(isFavoritesOnly || selectedCategories.length > 0 || selectedTypes.length > 0 || selectedPages.length > 0 || selectedPublishDates.length > 0 || selectedCreatorCategories.length > 0 || selectedCreatorTypes.length > 0 || selectedSpecializations.length > 0 || industrySearch) && (
                            <button
                                type="button"
                                onClick={handleResetAll}
                                className="flex items-center gap-[0.25vw] text-[0.8vw] text-[#ea7233] hover:text-[#d65a1c] font-semibold transition-colors cursor-pointer"
                            >
                                <span>Reset All</span>
                                <Icon icon="lucide:trash-2" className="w-[0.85vw] h-[0.85vw] text-[#ea7233]" />
                            </button>
                        )}
                    </div>

                    {/* Filter Card Container with exact Border Design */}
                    <div className="bg-white border border-gray-200 rounded-[0.5vw] flex flex-col shadow-sm divide-y divide-gray-200">
                        {exploreMode === 'books' ? (
                            <>
                                {/* 1. Category */}
                                <div className="p-[1.2vw] space-y-[1.5vh]">
                                    <div className="flex items-center gap-[0.5vw] text-slate-900 font-bold text-[0.95vw]">
                                        <Icon icon="mingcute:grid-line" className="w-[1.1vw] h-[1.1vw] text-slate-800" />
                                        <span>Category</span>
                                    </div>
                                    <div className="space-y-[1.2vh] pt-[0.5vh]">
                                        {[
                                            'Brochure',
                                            'Catalog',
                                            'Magazine',
                                            'Portfolio',
                                            'Storybook',
                                            'Photography Book',
                                            'Product Catalog'
                                        ].slice(0, showMoreCategories ? 7 : 6).map((item, idx) => (
                                            <label key={idx} className="flex items-center justify-between cursor-pointer group py-[0.1vh]">
                                                <div className="flex items-center gap-[0.6vw]">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(item)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedCategories([...selectedCategories, item]);
                                                            else setSelectedCategories(selectedCategories.filter(c => c !== item));
                                                        }}
                                                        className="w-[1.05vw] h-[1.05vw] min-w-[16px] min-h-[16px] rounded-[3px] border-slate-300 text-[#ea7233] accent-[#ea7233] cursor-pointer"
                                                    />
                                                    <span className="text-[0.85vw] text-slate-700 font-normal group-hover:text-black">{item}</span>
                                                </div>
                                                <span className="text-[0.7vw] font-medium text-slate-500 bg-slate-100 rounded-[0.25vw] px-[0.5vw] py-[0.1vh] min-w-[1.6vw] text-center">
                                                    {getCategoryCount(item)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowMoreCategories(!showMoreCategories)}
                                        className="text-[0.8vw] text-slate-400 font-medium flex items-center gap-[0.3vw] pt-[0.2vh] hover:text-slate-600 cursor-pointer"
                                    >
                                        <span>{showMoreCategories ? 'Show less' : 'Show more'}</span>
                                        <Icon icon="lucide:chevron-down" className={`w-[0.85vw] h-[0.85vw] transition-transform ${showMoreCategories ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* 2. Flipbook Type */}
                                <div className="p-[1.2vw] space-y-[1.5vh]">
                                    <div className="flex items-center gap-[0.5vw] text-slate-900 font-bold text-[0.95vw]">
                                        <Icon icon="lucide:file-text" className="w-[1.1vw] h-[1.1vw] text-slate-800" />
                                        <span>Flipbook Type</span>
                                    </div>
                                    <div className="space-y-[1.2vh] pt-[0.5vh]">
                                        {[
                                            'Landscape',
                                            'Portrait',
                                            'Square',
                                            '3D Added Flipbook'
                                        ].map((item, idx) => (
                                            <label key={idx} className="flex items-center justify-between cursor-pointer group py-[0.1vh]">
                                                <div className="flex items-center gap-[0.6vw]">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTypes.includes(item)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedTypes([...selectedTypes, item]);
                                                            else setSelectedTypes(selectedTypes.filter(t => t !== item));
                                                        }}
                                                        className="w-[1.05vw] h-[1.05vw] min-w-[16px] min-h-[16px] rounded-[3px] border-slate-300 text-[#ea7233] accent-[#ea7233] cursor-pointer"
                                                    />
                                                    <span className="text-[0.85vw] text-slate-700 font-normal group-hover:text-black">{item}</span>
                                                </div>
                                                <span className="text-[0.7vw] font-medium text-slate-500 bg-slate-100 rounded-[0.25vw] px-[0.5vw] py-[0.1vh] min-w-[1.6vw] text-center">
                                                    {getTypeCount(item)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowMoreTypes(!showMoreTypes)}
                                        className="text-[0.8vw] text-slate-400 font-medium flex items-center gap-[0.3vw] pt-[0.2vh] hover:text-slate-600 cursor-pointer"
                                    >
                                        <span>{showMoreTypes ? 'Show less' : 'Show more'}</span>
                                        <Icon icon="lucide:chevron-down" className={`w-[0.85vw] h-[0.85vw] transition-transform ${showMoreTypes ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* 3. Pages */}
                                <div className="p-[1.2vw] space-y-[1.5vh]">
                                    <div className="flex items-center gap-[0.5vw] text-slate-900 font-bold text-[0.95vw]">
                                        <Icon icon="fluent:document-one-page-multiple-20-regular" className="w-[1.1vw] h-[1.1vw] text-slate-800" />
                                        <span>Pages</span>
                                    </div>
                                    <div className="space-y-[1.2vh] pt-[0.5vh]">
                                        {[
                                            'All',
                                            '1 - 8 Pages',
                                            '8 - 16 Pages',
                                            '16 - 24 Pages',
                                            '24 - MAX Pages'
                                        ].map((item, idx) => (
                                            <label key={idx} className="flex items-center justify-between cursor-pointer group py-[0.1vh]">
                                                <div className="flex items-center gap-[0.6vw]">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPages.includes(item)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                if (item === 'All') setSelectedPages(['All']);
                                                                else setSelectedPages(prev => [...prev.filter(p => p !== 'All'), item]);
                                                            } else {
                                                                setSelectedPages(selectedPages.filter(p => p !== item));
                                                            }
                                                        }}
                                                        className="w-[1.05vw] h-[1.05vw] min-w-[16px] min-h-[16px] rounded-[3px] border-slate-300 text-[#ea7233] accent-[#ea7233] cursor-pointer"
                                                    />
                                                    <span className="text-[0.85vw] text-slate-700 font-normal group-hover:text-black">{item}</span>
                                                </div>
                                                <span className="text-[0.7vw] font-medium text-slate-500 bg-slate-100 rounded-[0.25vw] px-[0.5vw] py-[0.1vh] min-w-[1.6vw] text-center">
                                                    {getPageCount(item)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* 4. Publish Date */}
                                <div className="p-[1.2vw] space-y-[1.5vh]">
                                    <div className="flex items-center gap-[0.5vw] text-slate-900 font-bold text-[0.95vw]">
                                        <Icon icon="lucide:calendar" className="w-[1.1vw] h-[1.1vw] text-slate-800" />
                                        <span>Publish Date</span>
                                    </div>
                                    <div className="space-y-[1.2vh] pt-[0.5vh]">
                                        {[
                                            'All Time',
                                            'Today',
                                            'Before 3 days',
                                            'This Week',
                                            'This Month',
                                            'This Year'
                                        ].map((item, idx) => (
                                            <label key={idx} className="flex items-center justify-between cursor-pointer group py-[0.1vh]">
                                                <div className="flex items-center gap-[0.6vw]">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPublishDates.includes(item)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                if (item === 'All Time') setSelectedPublishDates(['All Time']);
                                                                else setSelectedPublishDates(prev => [...prev.filter(d => d !== 'All Time'), item]);
                                                            } else {
                                                                setSelectedPublishDates(selectedPublishDates.filter(d => d !== item));
                                                            }
                                                        }}
                                                        className="w-[1.05vw] h-[1.05vw] min-w-[16px] min-h-[16px] rounded-[3px] border-slate-300 text-[#ea7233] accent-[#ea7233] cursor-pointer"
                                                    />
                                                    <span className="text-[0.85vw] text-slate-700 font-normal group-hover:text-black">{item}</span>
                                                </div>
                                                <span className="text-[0.7vw] font-medium text-slate-500 bg-slate-100 rounded-[0.25vw] px-[0.5vw] py-[0.1vh] min-w-[1.6vw] text-center">
                                                    {getPublishDateCount(item)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* 1. Industry */}
                                <div className="p-[1.2vw] space-y-[1.5vh]">
                                    <div className="flex items-center gap-[0.5vw] text-slate-900 font-bold text-[0.95vw]">
                                        <Icon icon="lucide:line-chart" className="w-[1.1vw] h-[1.1vw] text-slate-800" />
                                        <span>Industry</span>
                                    </div>
                                    {/* Search Creators input */}
                                    <div className="relative flex items-center w-full">
                                        <Icon icon="lucide:search" className="w-[0.9vw] h-[0.9vw] text-gray-400 absolute left-[0.6vw]" />
                                        <input
                                            type="text"
                                            placeholder="Search Creators..."
                                            value={industrySearch}
                                            onChange={(e) => setIndustrySearch(e.target.value)}
                                            className="w-full pl-[2vw] pr-[0.8vw] py-[0.5vh] rounded-[0.35vw] border border-gray-200 text-[0.8vw] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black bg-white"
                                        />
                                    </div>
                                    <div className="space-y-[1.2vh] pt-[0.5vh]">
                                        {[
                                            'Manufacturing',
                                            'Healthcare',
                                            'Education',
                                            'Real estate',
                                            'Travel & Hospitality',
                                            'Food & Beverage',
                                            'Automotive',
                                            'Architecture'
                                        ].slice(0, showMoreIndustries ? 8 : 6).map((item, idx) => (
                                            <label key={idx} className="flex items-center justify-between cursor-pointer group py-[0.1vh]">
                                                <div className="flex items-center gap-[0.6vw]">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCreatorCategories.includes(item)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedCreatorCategories([...selectedCreatorCategories, item]);
                                                            else setSelectedCreatorCategories(selectedCreatorCategories.filter(c => c !== item));
                                                        }}
                                                        className="w-[1.05vw] h-[1.05vw] min-w-[16px] min-h-[16px] rounded-[3px] border-slate-300 text-[#ea7233] accent-[#ea7233] cursor-pointer"
                                                    />
                                                    <span className="text-[0.85vw] text-slate-700 font-normal group-hover:text-black">{item}</span>
                                                </div>
                                                <span className="text-[0.7vw] font-medium text-slate-500 bg-slate-100 rounded-[0.25vw] px-[0.5vw] py-[0.1vh] min-w-[1.6vw] text-center">
                                                    {getIndustryCount(item)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowMoreIndustries(!showMoreIndustries)}
                                        className="text-[0.8vw] text-slate-400 font-medium flex items-center gap-[0.3vw] pt-[0.2vh] hover:text-slate-600 cursor-pointer"
                                    >
                                        <span>{showMoreIndustries ? 'Show less' : 'Show more'}</span>
                                        <Icon icon="lucide:chevron-down" className={`w-[0.85vw] h-[0.85vw] transition-transform ${showMoreIndustries ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* 2. Creator Type */}
                                <div className="p-[1.2vw] space-y-[1.5vh]">
                                    <div className="flex items-center gap-[0.5vw] text-slate-900 font-bold text-[0.95vw]">
                                        <Icon icon="lucide:file-text" className="w-[1.1vw] h-[1.1vw] text-slate-800" />
                                        <span>Creator Type</span>
                                    </div>
                                    <div className="space-y-[1.2vh] pt-[0.5vh]">
                                        {[
                                            'Individual',
                                            'Freelancer',
                                            'Agency',
                                            'Company / Organization'
                                        ].map((item, idx) => (
                                            <label key={idx} className="flex items-center justify-between cursor-pointer group py-[0.1vh]">
                                                <div className="flex items-center gap-[0.6vw]">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCreatorTypes.includes(item)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedCreatorTypes([...selectedCreatorTypes, item]);
                                                            else setSelectedCreatorTypes(selectedCreatorTypes.filter(t => t !== item));
                                                        }}
                                                        className="w-[1.05vw] h-[1.05vw] min-w-[16px] min-h-[16px] rounded-[3px] border-slate-300 text-[#ea7233] accent-[#ea7233] cursor-pointer"
                                                    />
                                                    <span className="text-[0.85vw] text-slate-700 font-normal group-hover:text-black">{item}</span>
                                                </div>
                                                <span className="text-[0.7vw] font-medium text-slate-500 bg-slate-100 rounded-[0.25vw] px-[0.5vw] py-[0.1vh] min-w-[1.6vw] text-center">
                                                    {getCreatorTypeCount(item)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. Location */}
                                <div className="p-[1.2vw] space-y-[1.5vh]">
                                    <div className="flex items-center gap-[0.5vw] text-slate-900 font-bold text-[0.95vw]">
                                        <Icon icon="fa6-solid:map-pin" className="w-[1.1vw] h-[1.1vw] text-black" />
                                        <span>Location</span>
                                    </div>
                                    <div className="space-y-[1vh] pt-[0.5vh]">
                                        <CustomDropdown
                                            options={['All Countries', 'United States', 'India', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France']}
                                            value={selectedLocationCountry}
                                            onChange={(val) => { setSelectedLocationCountry(val); setSelectedLocationState('All States'); setSelectedLocationCity('All Cities'); }}
                                            className="w-full"
                                            renderButton={(val, isOpen, setIsOpen) => (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsOpen(!isOpen)}
                                                    className="flex items-center justify-between w-full border border-gray-200 rounded-[0.4vw] px-[0.8vw] py-[0.6vh] text-[0.85vw] text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-[0.5vw]">
                                                        <Icon icon="lucide:globe" className="w-[0.9vw] h-[0.9vw] text-gray-600" />
                                                        <span>{val === 'All Countries' ? 'Countries' : val}</span>
                                                    </div>
                                                    <Icon icon="lucide:chevron-down" className={`w-[0.9vw] h-[0.9vw] text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        />
                                        <CustomDropdown
                                            options={['All States', 'California', 'Tamil Nadu', 'Texas', 'New York', 'Ontario', 'England']}
                                            value={selectedLocationState}
                                            onChange={(val) => { setSelectedLocationState(val); setSelectedLocationCity('All Cities'); }}
                                            className="w-full"
                                            renderButton={(val, isOpen, setIsOpen) => (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsOpen(!isOpen)}
                                                    className="flex items-center justify-between w-full border border-gray-200 rounded-[0.4vw] px-[0.8vw] py-[0.6vh] text-[0.85vw] text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-[0.5vw]">
                                                        <Icon icon="fa6-solid:map-pin" className="w-[0.9vw] h-[0.9vw] text-gray-600" />
                                                        <span>{val === 'All States' ? 'State' : val}</span>
                                                    </div>
                                                    <Icon icon="lucide:chevron-down" className={`w-[0.9vw] h-[0.9vw] text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        />
                                        <CustomDropdown
                                            options={['All Cities', 'New York', 'Los Angeles', 'Coimbatore', 'Chennai', 'San Francisco', 'London', 'Toronto']}
                                            value={selectedLocationCity}
                                            onChange={setSelectedLocationCity}
                                            className="w-full"
                                            renderButton={(val, isOpen, setIsOpen) => (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsOpen(!isOpen)}
                                                    className="flex items-center justify-between w-full border border-gray-200 rounded-[0.4vw] px-[0.8vw] py-[0.6vh] text-[0.85vw] text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-[0.5vw]">
                                                        <Icon icon="fa6-solid:map-pin" className="w-[0.9vw] h-[0.9vw] text-gray-600" />
                                                        <span>{val === 'All Cities' ? 'City' : val}</span>
                                                    </div>
                                                    <Icon icon="lucide:chevron-down" className={`w-[0.9vw] h-[0.9vw] text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* 4. Service & Expertise */}
                                <div className="p-[1.2vw] space-y-[1.5vh]">
                                    <div className="flex items-center gap-[0.5vw] text-slate-900 font-bold text-[0.95vw]">
                                        <Icon icon="lucide:wrench" className="w-[1.1vw] h-[1.1vw] text-slate-800" />
                                        <span>Service & Expertise</span>
                                    </div>
                                    {/* Search box */}
                                    <div className="relative flex items-center w-full">
                                        <Icon icon="lucide:search" className="w-[0.9vw] h-[0.9vw] text-gray-400 absolute left-[0.6vw]" />
                                        <input
                                            type="text"
                                            placeholder="Search Creators..."
                                            className="w-full pl-[2vw] pr-[0.8vw] py-[0.5vh] rounded-[0.35vw] border border-gray-200 text-[0.8vw] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black bg-white"
                                        />
                                    </div>
                                    <div className="space-y-[1.2vh] pt-[0.5vh]">
                                        {[
                                            'Website',
                                            'Mobile Application',
                                            'Before 3 days',
                                            'This Week',
                                            'This Month',
                                            'This Year'
                                        ].map((item, idx) => (
                                            <label key={idx} className="flex items-center justify-between cursor-pointer group py-[0.1vh]">
                                                <div className="flex items-center gap-[0.6vw]">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSpecializations.includes(item)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedSpecializations([...selectedSpecializations, item]);
                                                            else setSelectedSpecializations(selectedSpecializations.filter(s => s !== item));
                                                        }}
                                                        className="w-[1.05vw] h-[1.05vw] min-w-[16px] min-h-[16px] rounded-[3px] border-slate-300 text-[#ea7233] accent-[#ea7233] cursor-pointer"
                                                    />
                                                    <span className="text-[0.85vw] text-slate-700 font-normal group-hover:text-black">{item}</span>
                                                </div>
                                                <span className="text-[0.7vw] font-medium text-slate-500 bg-slate-100 rounded-[0.25vw] px-[0.5vw] py-[0.1vh] min-w-[1.6vw] text-center">
                                                    {getSpecializationCount(item)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </aside>

                {/* RIGHT MAIN CONTENT SECTION */}
                <main className="flex-1 w-full flex flex-col gap-4">
                    
                    {/* Applied Filters Row (Always rendered to avoid layout shift) */}
                    <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 mr-1">Applied Filters :</span>
                        
                        {!(isFavoritesOnly || selectedTypes.length > 0 || selectedCategories.length > 0 || selectedPages.filter(p => p !== 'All').length > 0 || selectedPublishDates.filter(d => d !== 'All Time').length > 0 || selectedCreatorCategories.length > 0 || selectedCreatorTypes.length > 0 || selectedSpecializations.length > 0 || selectedCreatorBooks.filter(b => b !== 'All').length > 0 || selectedCreatorFollowers.filter(f => f !== 'All').length > 0) ? (
                            <span className="text-xs sm:text-sm font-medium text-[#ea7233]">None</span>
                        ) : (
                            <>
                                {isFavoritesOnly && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <Icon icon="fa6-solid:heart" className="w-3 h-3 text-[#ea7233]" />
                                        <span>Favorites</span>
                                        <button type="button" onClick={() => setIsFavoritesOnly(false)} className="hover:text-red-700 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}

                                {selectedCategories.map(cat => (
                                    <span key={`cat-${cat}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <span>{cat}</span>
                                        <button type="button" onClick={() => removeChip('cat', cat)} className="hover:text-red-600 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {selectedTypes.map(type => (
                                    <span key={`type-${type}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <span>{type}</span>
                                        <button type="button" onClick={() => removeChip('type', type)} className="hover:text-red-600 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {selectedPages.filter(p => p !== 'All').map(p => (
                                    <span key={`page-${p}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <span>{p}</span>
                                        <button type="button" onClick={() => removeChip('page', p)} className="hover:text-red-600 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {selectedPublishDates.filter(d => d !== 'All Time').map(d => (
                                    <span key={`date-${d}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <span>{d}</span>
                                        <button type="button" onClick={() => removeChip('date', d)} className="hover:text-red-600 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {selectedCreatorCategories.map(cat => (
                                    <span key={`creatorCat-${cat}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <span>{cat}</span>
                                        <button type="button" onClick={() => removeChip('creatorCat', cat)} className="hover:text-red-600 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {selectedCreatorTypes.map(type => (
                                    <span key={`creatorType-${type}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <span>{type}</span>
                                        <button type="button" onClick={() => removeChip('creatorType', type)} className="hover:text-red-600 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {selectedSpecializations.map(spec => (
                                    <span key={`spec-${spec}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <span>{spec}</span>
                                        <button type="button" onClick={() => removeChip('specialization', spec)} className="hover:text-red-600 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {selectedCreatorBooks.filter(b => b !== 'All').map(b => (
                                    <span key={`creatorBook-${b}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <span>{b}</span>
                                        <button type="button" onClick={() => removeChip('creatorBook', b)} className="hover:text-red-600 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {selectedCreatorFollowers.filter(f => f !== 'All').map(f => (
                                    <span key={`creatorFollower-${f}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#ea7233] border border-[#ea7233]/30 bg-[#fff5f3] shadow-2xs">
                                        <span>{f}</span>
                                        <button type="button" onClick={() => removeChip('creatorFollower', f)} className="hover:text-red-600 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </>
                        )}
                    </div>

                    {/* CARDS GRID */}
                    {exploreMode === 'creators' ? (
                        isCreatorsLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[1.5vw]">
                                {[...Array(8)].map((_, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs animate-pulse h-64"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5">
                                {filteredCreators.map((creator, index) => {
                                    const emailKey = (creator.emailId || creator.email || '').toLowerCase();
                                    return (
                                        <CreatorCard
                                            key={emailKey || index}
                                            index={index}
                                            creator={creator}
                                            onProfileClick={handleProfileClick}
                                            onToggleFollow={handleToggleFollow}
                                            isFollowingLoading={Boolean(followingLoadingMap[emailKey])}
                                            currentUserEmail={currentUserEmail}
                                        />
                                    );
                                })}
                                {filteredCreators.length === 0 && (
                                    <div className="col-span-full py-16 text-center font-semibold text-slate-600 text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        No creators found matching your search.
                                    </div>
                                )}
                            </div>
                        )
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-[1.5vw]">
                            {[...Array(8)].map((_, idx) => (
                                <FlipbookCardSkeleton key={idx} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center text-red-500">
                            <Icon icon="lucide:alert-circle" className="w-10 h-10 mx-auto mb-2" />
                            <p className="font-semibold text-sm">{error}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-[1.5vw]">
                            {sortedBooks.map((book, index) => (
                                <FlipbookCard
                                    key={book.v_id || index}
                                    v_id={book.v_id}
                                    shareId={book.shareId}
                                    access={book.access}
                                    rawBook={book.rawBook}
                                    authorPicture={book.authorPicture}
                                    authorBgColor={book.authorBgColor}
                                    bookName={book.bookName}
                                    authorName={book.authorName}
                                    location={book.location}
                                    pages={book.pages}
                                    views={book.views}
                                    rating={book.rating}
                                    description={book.description}
                                    onShare={handleOpenShareModal}
                                    onDownload={handleOpenExportModal}
                                    onProfileClick={handleProfileClick}
                                    onToggleFavorite={handleToggleFavorite}
                                    isFavorited={favoriteBookIds.includes(book.v_id)}
                                    isOwner={Boolean(
                                        currentUserEmail && (
                                            (book.rawBook?.userEmail && book.rawBook.userEmail.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) ||
                                            (book.rawBook?.emailId && book.rawBook.emailId.trim().toLowerCase() === currentUserEmail.trim().toLowerCase())
                                        )
                                    )}
                                />
                            ))}
                            {sortedBooks.length === 0 && (
                                <div className="col-span-full py-16 text-center font-semibold text-slate-600 text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p>No flipbooks found matching your filters.</p>
                                    <button
                                        type="button"
                                        onClick={handleResetAll}
                                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ea7233] hover:bg-[#d65a1c] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                                    >
                                        <span>Clear All Filters</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 w-full">
                <Footer />
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                currentBook={selectedBookForModal}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                currentBook={selectedBookForModal}
                isFromMyFlipbooks={true}
            />

            {/* Profile Modal */}
            <CreatorProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                creator={selectedCreator}
                favoriteBookIds={favoriteBookIds}
                onToggleFavorite={handleToggleFavorite}
            />

        </div>
    );
};

export default Explore;
