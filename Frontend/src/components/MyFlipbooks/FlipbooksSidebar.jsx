import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Trash2, Plus, Folder, MoreVertical, X, ArrowRight, ArrowLeft, Box, RotateCcw, Edit2, Library, Images } from 'lucide-react';
import CustomScrollbar from '../CustomScrollbar';
import { FolderSkeleton } from './FlipbookSkeleton';

const DEFAULT_FOLDER_COLORS = [
    '#f59e0b', // Yellow / Amber
    '#f43f5e', // Coral / Red / Rose
    '#10b981', // Emerald / Green
    '#38bdf8', // Sky Blue
    '#8b5cf6', // Violet / Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#6366f1', // Indigo
];

export default function FlipbooksSidebar({
    activeFolder,
    setActiveFolder,
    setSelectedBooks = () => {},
    books = [],
    folders = [],
    setFolders,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,
    onReorderFolders,
    creatingFolderName,
    storage,
    isLoadingStorage,
    isLoadingFolders = false,
    isUpgradeCardClosed,
    setIsUpgradeCardClosed,
    dashboardMode = 'books',
    setDashboardMode,
    active3dFolder = 'All Models',
    setActive3dFolder,
    threeDCounts = { allCount: 0, recentCount: 0 },
    // Optional overrides for backwards compatibility
    navigate: navigateProp,
    FOLDER_COLORS = DEFAULT_FOLDER_COLORS,
    ...rest
}) {
    const routerNavigate = useNavigate();
    const navigate = navigateProp || routerNavigate;

    // Folder Drag & Drop internal state
    const [dragFolderIndex, setDragFolderIndex] = useState(null);
    const [dragOverFolderIndex, setDragOverFolderIndex] = useState(null);

    // Context Menu internal state
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [folderMenuPos, setFolderMenuPos] = useState({ top: 0, left: 0, isDropup: false });

    // Inline Folder Creation internal state
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderInputName, setNewFolderInputName] = useState('');
    const internalFolderListRef = useRef(null);
    const folderListRef = rest.folderListRef || internalFolderListRef;

    // Inline Folder Renaming internal state
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState('');

    // Toggleable Storage Box state
    const [isStorageBoxOpen, setIsStorageBoxOpen] = useState(false);
    const storageContainerRef = useRef(null);

    // Real-time Duplicate Detection for Folder Creation
    const isNewFolderDuplicate = useMemo(() => {
        const trimmed = newFolderInputName.trim().toLowerCase();
        if (!trimmed) return false;
        const reserved = ['recent book', 'recent', 'trash', 'favorites', 'all flipbook', 'all flipbooks'];
        if (reserved.includes(trimmed)) return true;
        return (folders || []).some(f => {
            const name = (f.name || '').trim().toLowerCase();
            if ((f.isDefault || name === 'default') && (trimmed === 'my flipbooks' || trimmed === 'default')) return true;
            return name === trimmed;
        });
    }, [newFolderInputName, folders]);

    // Real-time Duplicate Detection for Folder Renaming
    const isEditFolderDuplicate = useMemo(() => {
        if (!editingId) return false;
        const trimmed = tempName.trim().toLowerCase();
        if (!trimmed) return false;
        const currentFolder = (folders || []).find(f => f.id === editingId);
        if (currentFolder && (currentFolder.name || '').trim().toLowerCase() === trimmed) {
            return false;
        }
        const reserved = ['recent book', 'recent', 'trash', 'favorites', 'all flipbook', 'all flipbooks'];
        if (reserved.includes(trimmed)) return true;
        return (folders || []).some(f => {
            if (f.id === editingId) return false;
            const name = (f.name || '').trim().toLowerCase();
            if ((f.isDefault || name === 'default') && (trimmed === 'my flipbooks' || trimmed === 'default')) return true;
            return name === trimmed;
        });
    }, [editingId, tempName, folders]);

    useEffect(() => {
        if (!isStorageBoxOpen) return;
        const handleOutsideClick = (e) => {
            if (storageContainerRef.current && !storageContainerRef.current.contains(e.target)) {
                setIsStorageBoxOpen(false);
            }
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsStorageBoxOpen(false);
        };
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isStorageBoxOpen]);

    const handleAddFolderClick = rest.handleAddFolderClick || (() => {
        setIsCreatingFolder(true);
        setNewFolderInputName('');
    });

    const saveNewFolder = rest.saveNewFolder || (() => {
        const trimmed = newFolderInputName.trim();
        if (!trimmed) {
            setIsCreatingFolder(false);
            setNewFolderInputName('');
            return;
        }
        if (isNewFolderDuplicate) {
            return;
        }
        setIsCreatingFolder(false);
        setNewFolderInputName('');
        onCreateFolder?.(trimmed);
    });

    const startEditing = rest.startEditing || ((folder) => {
        setEditingId(folder.id);
        setTempName(folder.name);
    });

    const saveEdit = rest.saveEdit || (() => {
        if (!editingId || !tempName.trim()) {
            setEditingId(null);
            return;
        }
        const folder = folders.find(f => f.id === editingId);
        if (!folder || folder.name.trim() === tempName.trim()) {
            setEditingId(null);
            return;
        }
        if (isEditFolderDuplicate) {
            return;
        }
        const currentFolderId = folder.id;
        const oldName = folder.name;
        const newName = tempName.trim();
        setEditingId(null);
        onRenameFolder?.(currentFolderId, oldName, newName);
    });

    const handleKeyDown = rest.handleKeyDown || ((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isEditFolderDuplicate) {
                return;
            }
            saveEdit();
        } else if (e.key === 'Escape') {
            setEditingId(null);
            setTempName('');
        }
    });

    const handleFolderDragStart = rest.handleFolderDragStart || ((e, index, folder) => {
        if (folder.name === 'Recent Book') {
            e.preventDefault();
            return;
        }
        setDragFolderIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    });

    const handleFolderDragOver = rest.handleFolderDragOver || ((e, index, folder) => {
        if (folder.name === 'Recent Book' || dragFolderIndex === null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverFolderIndex !== index) {
            setDragOverFolderIndex(index);
        }
    });

    const handleFolderDragLeave = rest.handleFolderDragLeave || ((e, index) => {
        if (dragOverFolderIndex === index) {
            setDragOverFolderIndex(null);
        }
    });

    const handleFolderDrop = rest.handleFolderDrop || ((e, dropIndex, targetFolder) => {
        e.preventDefault();
        if (targetFolder.name === 'Recent Book' || dragFolderIndex === null || dragFolderIndex === dropIndex) {
            setDragFolderIndex(null);
            setDragOverFolderIndex(null);
            return;
        }
        const next = [...folders];
        const [movedItem] = next.splice(dragFolderIndex, 1);
        next.splice(dropIndex, 0, movedItem);
        if (setFolders) setFolders(next);
        if (onReorderFolders) onReorderFolders(next);
        setDragFolderIndex(null);
        setDragOverFolderIndex(null);
    });

    const handleFolderDragEnd = rest.handleFolderDragEnd || (() => {
        setDragFolderIndex(null);
        setDragOverFolderIndex(null);
    });

    const handleDeleteFolderClick = (folder) => {
        setActiveMenuId(null);
        if (onDeleteFolder) {
            onDeleteFolder(folder);
        } else if (rest.handleDeleteFolderClick) {
            rest.handleDeleteFolderClick(folder);
        }
    };

    useEffect(() => {
        if ((isCreatingFolder || creatingFolderName) && folderListRef.current) {
            folderListRef.current.scrollTo({
                top: folderListRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [isCreatingFolder, creatingFolderName, folderListRef]);


    // Quick Access counts
    const allCount = books.filter(b => !b.trash && b.folder !== 'Trash' && b.folder !== 'Recent Book' && b.folder !== 'Recent' && !b.isOtherUserBook).length;
    const recentCount = books.filter(b => !b.trash && (b.folder === 'Recent Book' || b.folder === 'Recent')).length;
    const favoritesCount = books.filter(b => !b.trash && b.folder !== 'Trash' && b.folder !== 'Recent Book' && b.folder !== 'Recent' && Boolean(b.isFavorite || b.favorite || b.isFav)).length;
    const trashCount = books.filter(b => Boolean(b.trash || b.folder === 'Trash') && b.folder !== 'Recent Book' && b.folder !== 'Recent').length;

    // Helper to safely parse sizes to bytes (supports numbers or formatted strings like "36.8 MB", "500 KB")
    const parseSizeToBytes = (val) => {
        if (typeof val === 'number' && !isNaN(val)) return Math.max(0, Math.round(val));
        if (typeof val === 'string') {
            const trimmed = val.trim();
            const match = trimmed.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i);
            if (match) {
                const num = parseFloat(match[1]);
                if (isNaN(num)) return 0;
                const unit = (match[2] || 'B').toUpperCase();
                const mult = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024, TB: 1024 * 1024 * 1024 * 1024 };
                return Math.round(num * (mult[unit] || 1));
            }
        }
        return 0;
    };

    // Calculate real-time active storage consumed by flipbooks on screen (excluding duplicate Recent pointers & favorited external books)
    const liveBooksSize = useMemo(() => {
        if (!Array.isArray(books)) return 0;
        return books.reduce((acc, b) => {
            if (b.isOtherUserBook || b.folder === 'Recent Book' || b.folder === 'Recent' || String(b.id || '').startsWith('Recent_')) {
                return acc;
            }
            const pagesBytes = Array.isArray(b.pagesList)
                ? b.pagesList.reduce((s, p) => s + parseSizeToBytes(p?.size), 0)
                : 0;
            const bookBytes = Math.max(
                parseSizeToBytes(b.sizeBytes),
                parseSizeToBytes(b.fileSize),
                parseSizeToBytes(b.size),
                pagesBytes
            );
            return acc + bookBytes;
        }, 0);
    }, [books]);

    // Effective used storage: The greater of backend quota (which includes Gallery + Flipbook Assets + Disk)
    // or the live sum of active books visible on the user dashboard
    const effectiveUsed = Math.max(
        (typeof storage?.used === 'number' && !isNaN(storage.used)) ? storage.used : 0,
        liveBooksSize
    );
    const effectiveTotal = storage?.total > 0 ? storage.total : (300 * 1000 * 1000);

    const formatMB = (bytes) => {
        if (!bytes || bytes <= 0) return '0 MB';
        const mb = bytes / 1000000;
        if (mb < 0.1) return '0.1 MB';
        if (mb < 100) return `${parseFloat(mb.toFixed(1))} MB`;
        return `${Math.round(mb)} MB`;
    };

    const usedFormatted = formatMB(effectiveUsed);
    const totalFormatted = effectiveTotal >= 1000000000
        ? `${Math.round(effectiveTotal / 1000000000)} GB`
        : `${Math.round(effectiveTotal / 1000000)} MB`;
    const storagePercent = effectiveTotal > 0 ? Math.min(100, Math.round((effectiveUsed / effectiveTotal) * 100)) : 0;

    // Dynamic storage gradient flow and theme
    // <= 50%: Clean white flow
    // > 50% & < 85%: Gradient flow starting in crisp white, transitioning to glowing orange
    // >= 85%: Deep dark gradient flow from white through orange to warning red
    const storageTheme = useMemo(() => {
        if (storagePercent >= 85) {
            return {
                startColor: '#ffffff',
                midColor: '#ea543a',
                endColor: '#ef4444',
                accentColor: '#ef4444',
                glow: 'rgba(239, 68, 68, 0.45)',
                linearCss: 'linear-gradient(90deg, #ffffff 0%, #fb923c 40%, #ea543a 70%, #ef4444 100%)',
                badgeBg: '#ef4444'
            };
        }
        if (storagePercent > 50) {
            return {
                startColor: '#ffffff',
                midColor: '#fb923c',
                endColor: '#ea543a',
                accentColor: '#ea543a',
                glow: 'rgba(234, 84, 58, 0.45)',
                linearCss: 'linear-gradient(90deg, #ffffff 0%, #fb923c 50%, #ea543a 100%)',
                badgeBg: '#ea543a'
            };
        }
        return {
            startColor: '#ffffff',
            midColor: '#ffffff',
            endColor: '#cbd5e1',
            accentColor: '#ffffff',
            glow: 'rgba(255, 255, 255, 0.35)',
            linearCss: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
            badgeBg: '#ffffff'
        };
    }, [storagePercent]);

    // Continuous Conic Gradient background for unbroken circular progress flow
    const conicBackground = useMemo(() => {
        const p = Math.min(Math.max(storagePercent, 0), 100);
        const deg = (p / 100) * 360;

        if (p <= 0) {
            return 'transparent';
        }

        if (p <= 50) {
            // 0% to 50%: Pure clean crisp white arc
            return `conic-gradient(from 0deg, #ffffff 0deg, #ffffff ${deg}deg, transparent ${deg}deg, transparent 360deg)`;
        }

        if (p < 85) {
            // > 50% and < 85%: Starts white at 12 o'clock, smoothly flows into warm orange at 50%, reaching radiant orange at tip
            const whiteStop = Math.min(140, deg * 0.55);
            return `conic-gradient(from 0deg, #ffffff 0deg, #ffffff ${whiteStop}deg, #fb923c 180deg, #ea543a ${deg}deg, transparent ${deg}deg, transparent 360deg)`;
        }

        // >= 85%: Starts white, flows into orange at 50%, reaching warning crimson red at tip
        const whiteStop = 120;
        return `conic-gradient(from 0deg, #ffffff 0deg, #ffffff ${whiteStop}deg, #fb923c 180deg, #ea543a 270deg, #ef4444 ${deg}deg, transparent ${deg}deg, transparent 360deg)`;
    }, [storagePercent]);

    // Tip coordinates for rounded end cap along the circular stroke
    const tipCoords = useMemo(() => {
        const p = Math.min(Math.max(storagePercent, 0), 100);
        const deg = (p / 100) * 360;
        const rad = (deg - 90) * (Math.PI / 180);
        return {
            left: (50 + 46.5 * Math.cos(rad)).toFixed(2),
            top: (50 + 46.5 * Math.sin(rad)).toFixed(2)
        };
    }, [storagePercent]);

    const isBooksActive = dashboardMode === 'books' && activeFolder !== 'Favorites' && activeFolder !== 'Trash';
    const is3dActive = dashboardMode === '3d';
    const isShelfActive = dashboardMode === 'shelf';
    const isGalleryActive = dashboardMode === 'gallery';
    const isFavoritesActive = dashboardMode === 'favorites' || (dashboardMode === 'books' && activeFolder === 'Favorites');
    const isTrashActive = dashboardMode === 'trash' || (dashboardMode === 'books' && activeFolder === 'Trash');

    return (
        <aside className="w-[18vw] bg-[#151c28] h-[93vh] fixed left-0 top-[7vh] border-r border-[#1f293d] flex flex-col p-[1.2vw] z-20 select-none text-white">
            {/* Top Navigation: Go to Home */}
            <div
                onClick={() => navigate('/home')}
                className="flex items-center gap-[0.75vw] px-[0.6vw] py-[0.5vw] text-white/90 hover:text-white cursor-pointer transition-colors group select-none flex-none"
            >
                <ArrowLeft size="1vw" className="transition-transform group-hover:-translate-x-0.5" />
                <span className="text-[0.82vw] font-medium">Go to Home</span>
            </div>

            {/* Divider below Go to Home */}
            <div className="my-[0.7vw] border-b border-[#243042] flex-none"></div>

            {/* Main Section */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Upper Actions Section */}
                <div className="space-y-[0.25vw] flex-none">
                    {/* Create Flipibooks (Book Dashboard Switcher) */}
                    <div
                        onClick={() => {
                            if (setDashboardMode) {
                                setDashboardMode('books');
                            }
                            if (activeFolder === 'Favorites' || activeFolder === 'Trash') {
                                setActiveFolder('All Flipbook');
                            }
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            isBooksActive
                                ? 'bg-[#2c3749] text-white font-medium shadow-xs'
                                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                        }`}
                    >
                        <div className="flex items-center gap-[0.75vw]">
                            <BookOpen size="1.15vw" className={`shrink-0 ${isBooksActive ? 'text-white' : 'text-gray-300'}`} />
                            <span>Create Flipibooks</span>
                        </div>
                    </div>

                    {/* Add 3D Models (3D Dashboard Switcher) */}
                    <div
                        onClick={() => {
                            if (setDashboardMode) {
                                setDashboardMode('3d');
                            }
                            if (activeFolder === 'Favorites' || activeFolder === 'Trash') {
                                setActiveFolder('All Flipbook');
                            }
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            is3dActive
                                ? 'bg-[#2c3749] text-white font-medium shadow-xs'
                                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                        }`}
                    >
                        <div className="flex items-center gap-[0.75vw]">
                            <Box size="1.15vw" className={`shrink-0 ${is3dActive ? 'text-white' : 'text-gray-300'}`} />
                            <span>Add 3D Models</span>
                        </div>
                    </div>

                    {/* My Shelf (Shelf Dashboard Switcher) */}
                    <div
                        onClick={() => {
                            if (setDashboardMode) {
                                setDashboardMode('shelf');
                            }
                            if (activeFolder === 'Favorites' || activeFolder === 'Trash') {
                                setActiveFolder('All Flipbook');
                            }
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            isShelfActive
                                ? 'bg-[#2c3749] text-white font-medium shadow-xs'
                                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                        }`}
                    >
                        <div className="flex items-center gap-[0.75vw]">
                            <Library size="1.15vw" className={`shrink-0 ${isShelfActive ? 'text-white' : 'text-gray-300'}`} />
                            <span>My Shelf</span>
                        </div>
                    </div>

                    {/* Gallery Page Switcher */}
                    <div
                        onClick={() => {
                            if (setDashboardMode) {
                                setDashboardMode('gallery');
                            }
                            if (activeFolder === 'Favorites' || activeFolder === 'Trash') {
                                setActiveFolder('All Flipbook');
                            }
                            setSelectedBooks([]);
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            isGalleryActive
                                ? 'bg-[#2c3749] text-white font-medium shadow-xs'
                                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                        }`}
                    >
                        <div className="flex items-center gap-[0.75vw]">
                            <Images size="1.15vw" className={`shrink-0 ${isGalleryActive ? 'text-white' : 'text-gray-300'}`} />
                            <span>Gallery</span>
                        </div>
                    </div>

                    {/* Favorites */}
                    <div
                        onClick={() => {
                            if (setDashboardMode) setDashboardMode('favorites');
                            setActiveFolder('Favorites');
                            setSelectedBooks([]);
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            isFavoritesActive
                                ? 'bg-[#2c3749] text-white font-medium'
                                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                        }`}
                    >
                        <div className="flex items-center gap-[0.75vw]">
                            <Heart size="1.15vw" className={`shrink-0 ${isFavoritesActive ? 'text-white' : 'text-gray-300'}`} />
                            <span>Favorites</span>
                        </div>
                        <span className={`text-[0.8vw] ${isFavoritesActive ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {favoritesCount}
                        </span>
                    </div>

                    {/* Trash */}
                    <div
                        onClick={() => {
                            if (setDashboardMode) setDashboardMode('trash');
                            setActiveFolder('Trash');
                            setSelectedBooks([]);
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            isTrashActive
                                ? 'bg-[#2c3749] text-[#ef4444] font-medium'
                                : 'text-[#ef4444] hover:bg-[#1e2738] hover:text-[#f87171] font-normal'
                        }`}
                    >
                        <div className="flex items-center gap-[0.75vw]">
                            <Trash2 size="1.15vw" className="shrink-0 text-[#ef4444]" />
                            <span className="text-[#ef4444]">Trash</span>
                        </div>
                        <span className="text-[0.8vw] text-[#ef4444] font-medium">
                            {trashCount}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-[1vw] border-b border-[#243042] flex-none"></div>

                {!isShelfActive ? (
                    <>
                        {/* Folders Section Header (Dynamic: 3D Folders vs Your Folders) */}
                        <div className="flex items-center justify-between mb-[0.75vw] flex-none px-[0.2vw]">
                            <span className="text-[0.95vw] font-bold text-white">
                                {dashboardMode === '3d' ? '3D Folders' : 'Your Folders'}
                            </span>
                            {dashboardMode !== '3d' && (
                                <button
                                    onClick={handleAddFolderClick}
                                    className="flex items-center gap-[0.25vw] px-[0.6vw] py-[0.2vw] rounded-[0.4vw] bg-[#222d3d] hover:bg-[#2b394d] text-gray-300 hover:text-white text-[0.75vw] font-medium border border-[#2f3d52] transition-colors cursor-pointer"
                                >
                                    <Plus size="0.85vw" /> Add
                                </button>
                            )}
                        </div>

                {/* Scrollable Folder List */}
                <CustomScrollbar
                    ref={folderListRef}
                    color="#2c3749"
                    hoverColor="#3e4e66"
                    width="0.3vw"
                    className="flex-1 pr-[0.25vw] pb-[1vw]"
                >
                    {dashboardMode === '3d' ? (
                        /* 3D Folders List - Only Default Folder (All Models) & Recent */
                        <div className="space-y-[0.25vw]">
                            {/* Recent */}
                            <div
                                onClick={() => setActive3dFolder?.('Recent')}
                                className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                                    active3dFolder === 'Recent'
                                        ? 'bg-[#2c3749] text-white font-medium'
                                        : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                                }`}
                            >
                                <div className="flex items-center gap-[0.75vw]">
                                    <RotateCcw size="1.1vw" className={`shrink-0 ${active3dFolder === 'Recent' ? 'text-white' : 'text-gray-300'}`} />
                                    <span>Recent</span>
                                </div>
                                <span className={`text-[0.8vw] ${active3dFolder === 'Recent' ? 'text-white font-medium' : 'text-gray-400'}`}>
                                    {threeDCounts?.recentCount ?? 0}
                                </span>
                            </div>

                            {/* All Models */}
                            <div
                                onClick={() => setActive3dFolder?.('All Models')}
                                className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                                    (!active3dFolder || active3dFolder === 'All Models')
                                        ? 'bg-[#2c3749] text-white font-medium'
                                        : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                                }`}
                            >
                                <div className="flex items-center gap-[0.75vw]">
                                    <Folder size="1.15vw" className={`shrink-0 fill-current ${(!active3dFolder || active3dFolder === 'All Models') ? 'text-white' : 'text-gray-300'}`} />
                                    <span>All Models</span>
                                </div>
                                <span className={`text-[0.8vw] ${(!active3dFolder || active3dFolder === 'All Models') ? 'text-white font-medium' : 'text-gray-400'}`}>
                                    {threeDCounts?.allCount ?? 0}
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* Flipbook Folders List */
                        <div className="space-y-[0.25vw]">
                            {/* Recent */}
                            <div
                                onClick={() => {
                                    if (setDashboardMode) setDashboardMode('books');
                                    setActiveFolder('Recent');
                                    setSelectedBooks([]);
                                }}
                                className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                                    (activeFolder === 'Recent' || activeFolder === 'Recent Book')
                                        ? 'bg-[#2c3749] text-white font-medium'
                                        : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                                }`}
                            >
                                <div className="flex items-center gap-[0.75vw]">
                                    <RotateCcw size="1.1vw" className={`shrink-0 ${(activeFolder === 'Recent' || activeFolder === 'Recent Book') ? 'text-white' : 'text-gray-300'}`} />
                                    <span>Recent</span>
                                </div>
                                <span className={`text-[0.8vw] ${(activeFolder === 'Recent' || activeFolder === 'Recent Book') ? 'text-white font-medium' : 'text-gray-400'}`}>
                                    {recentCount}
                                </span>
                            </div>

                            {/* All Flipbooks */}
                            <div
                                onClick={() => {
                                    if (setDashboardMode) setDashboardMode('books');
                                    setActiveFolder('All Flipbook');
                                    setSelectedBooks([]);
                                }}
                                className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                                    (activeFolder === 'All Flipbook' || activeFolder === 'All Flipbooks')
                                        ? 'bg-[#2c3749] text-white font-medium'
                                        : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                                }`}
                            >
                                <div className="flex items-center gap-[0.75vw]">
                                    <Folder size="1.15vw" className={`shrink-0 fill-current ${(activeFolder === 'All Flipbook' || activeFolder === 'All Flipbooks') ? 'text-white' : 'text-gray-300'}`} />
                                    <span>All Flipbooks</span>
                                </div>
                                <span className={`text-[0.8vw] ${(activeFolder === 'All Flipbook' || activeFolder === 'All Flipbooks') ? 'text-white font-medium' : 'text-gray-400'}`}>
                                    {allCount}
                                </span>
                            </div>

                            {/* Custom Folders */}
                            {isLoadingFolders && (!folders || folders.length === 0) ? (
                                <FolderSkeleton count={4} />
                            ) : (
                                folders.map((folder, index) => {
                                const isEditing = editingId === folder.id;
                                const isActive = activeFolder === folder.name;
                                const isDragging = dragFolderIndex === index;
                                const isDragOver = dragOverFolderIndex === index && dragFolderIndex !== null && dragFolderIndex !== index;
                                const folderCount = books.filter(b => b.folder === folder.name && !b.trash).length;
                                const folderColor = FOLDER_COLORS[index % FOLDER_COLORS.length];

                                return isEditing ? (
                                    <div
                                        key={folder.id}
                                        style={{ border: isEditFolderDuplicate ? '1.5px solid #ef4444' : '1.5px solid #ffffff' }}
                                        className="w-full px-[0.85vw] py-[0.55vw] rounded-[0.5vw] bg-[#1c2636] shadow-sm flex flex-col"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onBlur={() => {
                                                if (isEditFolderDuplicate) {
                                                    setEditingId(null);
                                                    setTempName('');
                                                } else {
                                                    saveEdit();
                                                }
                                            }}
                                            onKeyDown={handleKeyDown}
                                            className="w-full text-[0.875vw] font-medium text-white bg-transparent focus:outline-none"
                                        />
                                        {isEditFolderDuplicate && (
                                            <p className="text-[#ef4444] text-[0.65vw] font-medium mt-[0.2vw] px-[0.1vw]">
                                                This folder name already exists
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                <div
                                    key={folder.id}
                                    draggable={!isEditing}
                                    onDragStart={(e) => handleFolderDragStart(e, index, folder)}
                                    onDragOver={(e) => handleFolderDragOver(e, index, folder)}
                                    onDragLeave={(e) => handleFolderDragLeave(e, index)}
                                    onDrop={(e) => handleFolderDrop(e, index, folder)}
                                    onDragEnd={handleFolderDragEnd}
                                    onClick={() => {
                                        if (setDashboardMode) setDashboardMode('books');
                                        setActiveFolder(folder.name);
                                        setSelectedBooks([]);
                                    }}
                                    className={`relative group folder-item-row w-full flex items-center gap-[0.75vw] px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] text-left cursor-pointer select-none
                                        ${isDragging ? 'opacity-40 scale-[0.98] border border-dashed border-[#ec5137]' : ''}
                                        ${isDragOver ? 'border-t-2 border-t-[#ec5137] bg-white/5' : ''}
                                        ${isActive
                                            ? 'bg-[#2c3749] text-white font-medium'
                                            : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                                        }
                                    `}
                                >
                                    {/* Colorful filled folder icon */}
                                    <Folder
                                        size="1.15vw"
                                        className="shrink-0 fill-current"
                                        style={{ color: folderColor }}
                                    />

                                    <span className="truncate flex-1 font-medium">{folder.name}</span>

                                    <div className="relative flex items-center justify-end h-[1.5vw] min-w-[1.5vw]">
                                        <span className={`folder-count-span text-[0.8vw] transition-all duration-200 ease-in-out ${isActive ? 'text-white font-medium' : 'text-gray-400 font-normal'} ${activeMenuId === folder.id ? 'has-active-menu pr-[2vw]' : 'pr-[0.25vw] group-hover:pr-[2vw]'}`}>
                                            {folderCount}
                                        </span>

                                        {/* Options Menu Trigger */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (activeMenuId === folder.id) {
                                                    setActiveMenuId(null);
                                                } else {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const spaceBelow = window.innerHeight - rect.bottom;
                                                    const isDropup = spaceBelow < 120;
                                                    setFolderMenuPos({
                                                        top: isDropup ? rect.top - 5 : rect.bottom + 5,
                                                        left: rect.right,
                                                        isDropup
                                                    });
                                                    setActiveMenuId(folder.id);
                                                }
                                            }}
                                            className={`folder-menu-btn absolute right-0 p-[0.3vw] flex items-center justify-center rounded-[0.4vw] bg-transparent transition-all cursor-pointer hover:bg-[#344257] text-gray-400 hover:text-white ${
                                                activeMenuId === folder.id ? 'active opacity-100' : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                        >
                                            <MoreVertical size="0.9vw" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}

                        {/* New Folder Input */}
                        {isCreatingFolder && (
                            <div
                                style={{ border: isNewFolderDuplicate ? '1.5px solid #ef4444' : '1.5px solid #ffffff' }}
                                className="w-full px-[0.85vw] py-[0.55vw] rounded-[0.5vw] bg-[#1c2636] shadow-sm flex flex-col animate-in fade-in slide-in-from-top-2 duration-300"
                            >
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Folder Name..."
                                    value={newFolderInputName}
                                    onChange={(e) => setNewFolderInputName(e.target.value)}
                                    onBlur={() => {
                                        if (isNewFolderDuplicate) {
                                            setIsCreatingFolder(false);
                                            setNewFolderInputName('');
                                        } else {
                                            saveNewFolder();
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (isNewFolderDuplicate) {
                                                return;
                                            }
                                            saveNewFolder();
                                        } else if (e.key === 'Escape') {
                                            setIsCreatingFolder(false);
                                            setNewFolderInputName('');
                                        }
                                    }}
                                    className="w-full text-[0.875vw] font-medium text-white bg-transparent focus:outline-none placeholder-gray-500"
                                />
                                {isNewFolderDuplicate && (
                                    <p className="text-[#ef4444] text-[0.65vw] font-medium mt-[0.2vw] px-[0.1vw]">
                                        This folder name already exists
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Creating Folder Loading Row */}
                        {creatingFolderName && (
                            <div style={{ border: '1.5px solid #ffffff' }} className="w-full flex items-center justify-between gap-[0.75vw] px-[0.85vw] py-[0.55vw] rounded-[0.5vw] bg-[#1c2636] text-white text-[0.875vw] font-medium shadow-sm animate-in fade-in duration-200">
                                <div className="flex items-center gap-[0.75vw] min-w-0 flex-1">
                                    <Folder size="1.15vw" className="text-amber-500 fill-current shrink-0" />
                                    <span className="truncate">{creatingFolderName}</span>
                                </div>
                                <div className="w-[1.1vw] h-[1.1vw] border-[2px] border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
                            </div>
                        )}
                    </div>
                )}
                </CustomScrollbar>
                    </>
                ) : (
                    <div className="flex-1" />
                )}
            </div>

            {/* Storage & Upgrade Profile Toggleable Widget */}
            <div ref={storageContainerRef} className="mt-auto relative z-30 pt-[0.6vw] flex-none">
                {/* Floating Storage Card Popover (Shown on click toggle) */}
                {isStorageBoxOpen && (
                    <>
                        {/* Backdrop to close modal when clicking outside */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsStorageBoxOpen(false);
                            }}
                        />

                        <div className="absolute bottom-[calc(100%+0.6vw)] left-0 w-full bg-white rounded-[0.6vw] p-[0.85vw] border border-gray-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex flex-col select-none z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            {/* Top Header: Database/Storage Icon + Title + Close Button */}
                            <div className="flex items-center justify-between mb-[0.55vw]">
                                <div className="flex items-center gap-[0.5vw]">
                                    <div className="relative flex items-center justify-center">
                                        <svg width="0.95vw" height="0.95vw" viewBox="0 0 24 24" fill="none" stroke="#ea543a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <ellipse cx="12" cy="5" rx="8.5" ry="2.8" />
                                            <path d="M3.5 5v7c0 1.55 3.8 2.8 8.5 2.8s8.5-1.25 8.5-2.8V5" />
                                            <path d="M3.5 12v7c0 1.55 3.8 2.8 8.5 2.8s8.5-1.25 8.5-2.8v-7" />
                                        </svg>
                                        <div className="absolute -top-[0.08vw] -right-[0.1vw] w-[0.32vw] h-[0.32vw] bg-[#ea543a] rounded-full ring-2 ring-white"></div>
                                    </div>
                                    <span className="text-[0.82vw] font-semibold text-[#374151]">Storage</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsStorageBoxOpen(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-[0.2vw] rounded-full transition-colors cursor-pointer flex items-center justify-center -mr-[0.2vw] -mt-[0.2vw]"
                                    title="Close Storage"
                                    aria-label="Close Storage"
                                >
                                    <X size="0.85vw" strokeWidth={2.2} />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-[0.32vw] bg-[#e5e7eb] rounded-full overflow-hidden mb-[0.45vw]">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${storagePercent}%`,
                                        background: storageTheme.linearCss
                                    }}
                                ></div>
                            </div>

                            {/* Storage Usage Stats */}
                            <div className="flex items-center justify-between text-[0.7vw] text-[#4b5563] font-semibold mb-[0.55vw]">
                                <span>
                                    {isLoadingStorage ? 'Calculating...' : `${usedFormatted} of ${totalFormatted} used`}
                                </span>
                                <span style={{ color: storageTheme.accentColor }} className="font-semibold transition-colors duration-300">{storagePercent}%</span>
                            </div>

                            {/* Small Upgrade Button with Gradient Background */}
                            <div className="pt-[0.45vw] border-t border-[#f3f4f6]">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsStorageBoxOpen(false);
                                        navigate('/settings/profile');
                                    }}
                                    className="w-full py-[0.42vw] px-[0.75vw] rounded-[0.5vw] text-[0.75vw] font-semibold text-white flex items-center justify-center gap-[0.35vw] shadow-[0_3px_12px_rgba(234,84,58,0.3)] hover:shadow-[0_4px_16px_rgba(234,84,58,0.45)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer group"
                                    style={{
                                        background: 'linear-gradient(135deg, #fb923c 0%, #ea543a 50%, #dc2626 100%)'
                                    }}
                                >
                                    <span>Upgrade</span>
                                    <ArrowRight size="0.75vw" strokeWidth={2.4} className="transition-transform group-hover:translate-x-[0.15vw]" />
                                </button>
                            </div>

                            {/* Downward pointer caret */}
                            <div className="absolute -bottom-[0.35vw] left-[1.1vw] w-[0.7vw] h-[0.7vw] bg-white border-r border-b border-gray-200/90 rotate-45"></div>
                        </div>
                    </>
                )}

                {/* Collapsed Trigger Button: Storage Icon with circular percentage border */}
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setIsStorageBoxOpen((prev) => !prev)}
                        className={`relative flex items-center justify-center p-[0.2vw] rounded-full transition-all duration-200 cursor-pointer focus:outline-none group ${
                            isStorageBoxOpen ? 'scale-105' : 'hover:scale-105'
                        }`}
                        title={`Storage: ${storagePercent}% used (${usedFormatted} of ${totalFormatted}) - Click to toggle details`}
                        aria-expanded={isStorageBoxOpen}
                        aria-label="Toggle storage usage details"
                    >
                        {/* Circular Progress Ring */}
                        <div className="relative w-[2.6vw] h-[2.6vw] min-w-[40px] min-h-[40px] flex items-center justify-center">
                            {/* Background Track Circle */}
                            <div className="absolute inset-0 rounded-full border-[2.6px] border-[#243042] bg-[#141a24] box-border" />

                            {/* Continuous Conic Gradient Progress Arc */}
                            <div
                                className="absolute inset-0 rounded-full pointer-events-none transition-all duration-700 ease-out"
                                style={{
                                    background: conicBackground,
                                    mask: 'radial-gradient(farthest-side, transparent calc(100% - 2.8px), #fff calc(100% - 2.6px))',
                                    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2.8px), #fff calc(100% - 2.6px))',
                                    filter: `drop-shadow(0 0 4px ${storageTheme.glow})`
                                }}
                            />


                            {/* End Round Cap at active progress tip */}
                            {storagePercent > 1 && storagePercent < 99 && (
                                <div
                                    className="absolute w-[2.6px] h-[2.6px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 ease-out"
                                    style={{
                                        top: `${tipCoords.top}%`,
                                        left: `${tipCoords.left}%`,
                                        backgroundColor: storageTheme.accentColor,
                                        boxShadow: `0 0 4px ${storageTheme.glow}`
                                    }}
                                />
                            )}

                            {/* Database/Storage Icon Centered Inside */}
                            <div className="relative z-10 flex items-center justify-center pointer-events-none">
                                <div className="relative flex items-center justify-center">
                                    <svg width="1.1vw" height="1.1vw" className="min-w-[16px] min-h-[16px]" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <ellipse cx="12" cy="5" rx="8.5" ry="2.8" />
                                        <path d="M3.5 5v7c0 1.55 3.8 2.8 8.5 2.8s8.5-1.25 8.5-2.8V5" />
                                        <path d="M3.5 12v7c0 1.55 3.8 2.8 8.5 2.8s8.5-1.25 8.5-2.8v-7" />
                                    </svg>
                                    <div
                                        className="absolute -top-[0.08vw] -right-[0.1vw] w-[0.32vw] h-[0.32vw] min-w-[5px] min-h-[5px] rounded-full ring-2 ring-[#1b2433] transition-colors duration-500"
                                        style={{ backgroundColor: storageTheme.badgeBg }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Global Folder Dropdown Portal */}
            {activeMenuId && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}></div>
                    <div
                        className="fixed z-[101] w-[12vw] min-w-[165px] bg-[#1a2433] rounded-[0.65vw] shadow-[0_12px_36px_rgba(0,0,0,0.5)] border border-[#2b3a4e] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        style={{
                            top: folderMenuPos.top,
                            left: folderMenuPos.left,
                            transform: folderMenuPos.isDropup ? 'translate(-100%, -100%)' : 'translate(-100%, 0)'
                        }}
                    >
                        {(() => {
                            const folder = folders?.find(f => f.id === activeMenuId);
                            if (!folder) return null;
                            const fLower = (folder.name || '').toLowerCase().trim();
                            const isDefault = Boolean(folder.isDefault) || fLower === 'my flipbooks' || fLower === 'default';

                            return (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(null);
                                            startEditing(folder);
                                        }}
                                        className={`w-full flex items-center gap-[0.55vw] px-[0.8vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-200 hover:bg-[#2c3749] hover:text-white transition-colors group cursor-pointer ${
                                            !isDefault ? 'border-b border-[#253346]' : ''
                                        }`}
                                    >
                                        <Edit2 size="0.88vw" className="text-gray-400 group-hover:text-white transition-colors shrink-0" />
                                        <span>Rename</span>
                                    </button>
                                    {!isDefault && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(null);
                                                handleDeleteFolderClick(folder);
                                            }}
                                            className="w-full flex items-center gap-[0.55vw] px-[0.8vw] py-[0.625vw] text-[0.75vw] font-medium text-[#f87171] hover:bg-[#ef4444] hover:text-white transition-colors group cursor-pointer"
                                        >
                                            <Trash2 size="0.88vw" className="text-[#f87171] group-hover:text-white transition-colors shrink-0" />
                                            <span>Delete</span>
                                        </button>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </>
            )}
        </aside>
    );
}
