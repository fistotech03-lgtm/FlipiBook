import React from 'react';
import { BookOpen, Heart, Trash2, Plus, Folder, MoreVertical, X, ArrowRight, ArrowLeft, Box, RotateCcw, Edit2, Copy } from 'lucide-react';
import CustomScrollbar from '../CustomScrollbar';

export default function FlipbooksSidebar({
    activeFolder,
    setActiveFolder,
    setSelectedBooks,
    books,
    folders,
    handleAddFolderClick,
    folderListRef,
    editingId,
    tempName,
    setTempName,
    saveEdit,
    handleKeyDown,
    dragFolderIndex,
    dragOverFolderIndex,
    handleFolderDragStart,
    handleFolderDragOver,
    handleFolderDragLeave,
    handleFolderDrop,
    handleFolderDragEnd,
    activeMenuId,
    setActiveMenuId,
    folderMenuPos,
    setFolderMenuPos,
    isCreatingFolder,
    setIsCreatingFolder,
    newFolderInputName,
    setNewFolderInputName,
    saveNewFolder,
    creatingFolderName,
    storage,
    isLoadingStorage,
    isUpgradeCardClosed,
    setIsUpgradeCardClosed,
    navigate,
    startEditing,
    handleDuplicateFolder,
    handleDeleteFolderClick,
    FOLDER_COLORS,
    setIsCreateModalOpen,
    dashboardMode = 'books',
    setDashboardMode,
    active3dFolder = 'All Models',
    setActive3dFolder,
}) {
    // 3D Folders state matching the reference mockup
    const [threeDFolders, setThreeDFolders] = React.useState([
        { id: '3d-1', name: 'Motors', count: 1, color: '#f59e0b' },
        { id: '3d-2', name: 'Pumps', count: 2, color: '#f43f5e' },
        { id: '3d-3', name: 'Models for Book', count: 1, color: '#10b981' },
        { id: '3d-4', name: 'Texture added Models', count: 4, color: '#38bdf8' },
    ]);
    const [isCreating3dFolder, setIsCreating3dFolder] = React.useState(false);
    const [new3dFolderInputName, setNew3dFolderInputName] = React.useState('');
    const [editing3dFolderId, setEditing3dFolderId] = React.useState(null);
    const [temp3dFolderName, setTemp3dFolderName] = React.useState('');

    const startEditing3dFolder = (folder) => {
        setEditing3dFolderId(folder.id);
        setTemp3dFolderName(folder.name);
    };

    const save3dEdit = () => {
        if (!editing3dFolderId || !temp3dFolderName.trim()) {
            setEditing3dFolderId(null);
            return;
        }
        const trimmed = temp3dFolderName.trim();
        const currentFolder = threeDFolders.find(f => f.id === editing3dFolderId);
        if (currentFolder && active3dFolder === currentFolder.name) {
            setActive3dFolder?.(trimmed);
        }
        setThreeDFolders(prev => prev.map(f => f.id === editing3dFolderId ? { ...f, name: trimmed } : f));
        setEditing3dFolderId(null);
        setTemp3dFolderName('');
    };

    const handle3dKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            save3dEdit();
        } else if (e.key === 'Escape') {
            setEditing3dFolderId(null);
            setTemp3dFolderName('');
        }
    };

    const handleDuplicate3dFolder = (folder) => {
        const baseName = folder.name.replace(/ \(Copy( \d+)?\)$/, '');
        let newName = `${baseName} (Copy)`;
        let counter = 1;
        while (threeDFolders.some(f => f.name.toLowerCase() === newName.toLowerCase())) {
            counter++;
            newName = `${baseName} (Copy ${counter})`;
        }
        const newFolder = {
            id: `3d-${Date.now()}`,
            name: newName,
            count: folder.count || 0,
            color: folder.color || '#f59e0b'
        };
        setThreeDFolders(prev => [...prev, newFolder]);
        setActive3dFolder?.(newName);
    };

    const handleDelete3dFolder = (folder) => {
        setThreeDFolders(prev => prev.filter(f => f.id !== folder.id));
        if (active3dFolder === folder.name) {
            setActive3dFolder?.('All Models');
        }
    };

    const saveNew3dFolder = () => {
        if (!new3dFolderInputName.trim()) {
            setIsCreating3dFolder(false);
            setNew3dFolderInputName('');
            return;
        }
        const trimmed = new3dFolderInputName.trim();
        setThreeDFolders(prev => [
            ...prev,
            {
                id: `3d-${Date.now()}`,
                name: trimmed,
                count: 0,
                color: FOLDER_COLORS[prev.length % FOLDER_COLORS.length]
            }
        ]);
        setActive3dFolder?.(trimmed);
        setIsCreating3dFolder(false);
        setNew3dFolderInputName('');
    };

    // Quick Access counts
    const allCount = books.filter(b => !b.trash && b.folder !== 'Trash' && b.folder !== 'Recent Book' && b.folder !== 'Recent').length;
    const recentCount = books.filter(b => !b.trash && (b.folder === 'Recent Book' || b.folder === 'Recent')).length;
    const favoritesCount = books.filter(b => !b.trash && b.folder !== 'Trash' && b.folder !== 'Recent Book' && b.folder !== 'Recent' && Boolean(b.isFavorite || b.favorite || b.isFav)).length;
    const trashCount = books.filter(b => Boolean(b.trash || b.folder === 'Trash') && b.folder !== 'Recent Book' && b.folder !== 'Recent').length;

    // Storage formatting
    const fallbackBooksSize = Array.isArray(books) ? books.reduce((acc, b) => acc + (b.sizeBytes || b.fileSize || 0), 0) : 0;
    const effectiveUsed = (typeof storage?.used === 'number' && !isNaN(storage.used)) ? storage.used : fallbackBooksSize;
    const effectiveTotal = storage?.total > 0 ? storage.total : (300 * 1024 * 1024);

    const formatMB = (bytes) => {
        if (!bytes || bytes <= 0) return '0 MB';
        const mb = bytes / (1024 * 1024);
        if (mb < 0.1) return '0.1 MB';
        if (mb < 100) return `${parseFloat(mb.toFixed(1))} MB`;
        return `${Math.round(mb)} MB`;
    };

    const usedFormatted = formatMB(effectiveUsed);
    const totalFormatted = effectiveTotal >= 1024 * 1024 * 1024
        ? `${Math.round(effectiveTotal / (1024 * 1024 * 1024))} GB`
        : `${Math.round(effectiveTotal / (1024 * 1024))} MB`;
    const storagePercent = effectiveTotal > 0 ? Math.min(100, Math.round((effectiveUsed / effectiveTotal) * 100)) : 0;

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
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            dashboardMode === 'books'
                                ? 'bg-[#2c3749] text-white font-medium shadow-xs'
                                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                        }`}
                    >
                        <div className="flex items-center gap-[0.75vw]">
                            <BookOpen size="1.15vw" className={`shrink-0 ${dashboardMode === 'books' ? 'text-white' : 'text-gray-300'}`} />
                            <span>Create Flipibooks</span>
                        </div>
                    </div>

                    {/* Add 3D Models (3D Dashboard Switcher) */}
                    <div
                        onClick={() => {
                            if (setDashboardMode) {
                                setDashboardMode('3d');
                            }
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            dashboardMode === '3d'
                                ? 'bg-[#2c3749] text-white font-medium shadow-xs'
                                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                        }`}
                    >
                        <div className="flex items-center gap-[0.75vw]">
                            <Box size="1.15vw" className={`shrink-0 ${dashboardMode === '3d' ? 'text-white' : 'text-gray-300'}`} />
                            <span>Add 3D Models</span>
                        </div>
                    </div>

                    {/* Favorites */}
                    <div
                        onClick={() => {
                            if (setDashboardMode) setDashboardMode('books');
                            setActiveFolder('Favorites');
                            setSelectedBooks([]);
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            dashboardMode === 'books' && activeFolder === 'Favorites'
                                ? 'bg-[#2c3749] text-white font-medium'
                                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                        }`}
                    >
                        <div className="flex items-center gap-[0.75vw]">
                            <Heart size="1.15vw" className={`shrink-0 ${dashboardMode === 'books' && activeFolder === 'Favorites' ? 'text-white' : 'text-gray-300'}`} />
                            <span>Favorites</span>
                        </div>
                        <span className={`text-[0.8vw] ${dashboardMode === 'books' && activeFolder === 'Favorites' ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {favoritesCount}
                        </span>
                    </div>

                    {/* Trash */}
                    <div
                        onClick={() => {
                            if (setDashboardMode) setDashboardMode('books');
                            setActiveFolder('Trash');
                            setSelectedBooks([]);
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                            dashboardMode === 'books' && activeFolder === 'Trash'
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

                {/* Folders Section Header (Dynamic: 3D Folders vs Your Folders) */}
                <div className="flex items-center justify-between mb-[0.75vw] flex-none px-[0.2vw]">
                    <span className="text-[0.95vw] font-bold text-white">
                        {dashboardMode === '3d' ? '3D Folders' : 'Your Folders'}
                    </span>
                    <button
                        onClick={() => {
                            if (dashboardMode === '3d') {
                                setIsCreating3dFolder(true);
                                setNew3dFolderInputName('');
                            } else {
                                handleAddFolderClick();
                            }
                        }}
                        className="flex items-center gap-[0.25vw] px-[0.6vw] py-[0.2vw] rounded-[0.4vw] bg-[#222d3d] hover:bg-[#2b394d] text-gray-300 hover:text-white text-[0.75vw] font-medium border border-[#2f3d52] transition-colors cursor-pointer"
                    >
                        <Plus size="0.85vw" /> Add
                    </button>
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
                        /* 3D Folders List */
                        <div className="space-y-[0.25vw]">
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
                                    8
                                </span>
                            </div>

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
                                    4
                                </span>
                            </div>

                            {/* Custom 3D Folders */}
                            {threeDFolders.map((folder, index) => {
                                const isEditing = editing3dFolderId === folder.id;
                                const isActive = active3dFolder === folder.name;
                                const isMenuOpen = activeMenuId === folder.id;

                                return isEditing ? (
                                    <div key={folder.id} className="w-full px-[0.85vw] py-[0.55vw] rounded-[0.5vw] border border-[#ec5137] bg-[#1c2636] shadow-sm">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={temp3dFolderName}
                                            onChange={(e) => setTemp3dFolderName(e.target.value)}
                                            onBlur={save3dEdit}
                                            onKeyDown={handle3dKeyDown}
                                            className="w-full text-[0.875vw] font-medium text-white bg-transparent focus:outline-none"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        key={folder.id}
                                        onClick={() => setActive3dFolder?.(folder.name)}
                                        className={`relative group folder-item-row w-full flex items-center gap-[0.75vw] px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] text-left cursor-pointer select-none ${
                                            isActive
                                                ? 'bg-[#2c3749] text-white font-medium'
                                                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                                        }`}
                                    >
                                        <Folder
                                            size="1.15vw"
                                            className="shrink-0 fill-current"
                                            style={{ color: folder.color }}
                                        />
                                        <span className="truncate flex-1 font-medium">{folder.name}</span>

                                        <div className="relative flex items-center justify-end h-[1.5vw] min-w-[1.5vw]">
                                            <span className={`folder-count-span text-[0.8vw] transition-all duration-200 ease-in-out ${isActive ? 'text-white font-medium' : 'text-gray-400 font-normal'} ${isMenuOpen ? 'has-active-menu pr-[2vw]' : 'pr-[0.25vw] group-hover:pr-[2vw]'}`}>
                                                {folder.count}
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
                                                    isMenuOpen ? 'active opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                }`}
                                            >
                                                <MoreVertical size="0.9vw" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* New 3D Folder Inline Input */}
                            {isCreating3dFolder && (
                                <div className="w-full px-[0.85vw] py-[0.55vw] rounded-[0.5vw] border border-[#ec5137] bg-[#1c2636] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Folder Name..."
                                        value={new3dFolderInputName}
                                        onChange={(e) => setNew3dFolderInputName(e.target.value)}
                                        onBlur={saveNew3dFolder}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                saveNew3dFolder();
                                            }
                                            if (e.key === 'Escape') {
                                                setIsCreating3dFolder(false);
                                                setNew3dFolderInputName('');
                                            }
                                        }}
                                        className="w-full text-[0.875vw] font-medium text-white bg-transparent focus:outline-none placeholder-gray-500"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Flipbook Folders List */
                        <div className="space-y-[0.25vw]">
                            {/* All Flipbooks */}
                            <div
                                onClick={() => { setActiveFolder('All Flipbook'); setSelectedBooks([]); }}
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

                            {/* Recent */}
                            <div
                                onClick={() => { setActiveFolder('Recent'); setSelectedBooks([]); }}
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

                            {/* Custom Folders */}
                            {folders.map((folder, index) => {
                                const isEditing = editingId === folder.id;
                                const isActive = activeFolder === folder.name;
                                const isDragging = dragFolderIndex === index;
                                const isDragOver = dragOverFolderIndex === index && dragFolderIndex !== null && dragFolderIndex !== index;
                                const folderCount = books.filter(b => b.folder === folder.name && !b.trash).length;
                                const folderColor = FOLDER_COLORS[index % FOLDER_COLORS.length];

                                return isEditing ? (
                                    <div key={folder.id} className="w-full px-[0.85vw] py-[0.55vw] rounded-[0.5vw] border border-[#ec5137] bg-[#1c2636] shadow-sm">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={tempName}

                                        onChange={(e) => setTempName(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={handleKeyDown}
                                        className="w-full text-[0.875vw] font-medium text-white bg-transparent focus:outline-none"
                                    />
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
                                    onClick={() => { setActiveFolder(folder.name); setSelectedBooks([]); }}
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
                        })}

                        {/* New Folder Input */}
                        {isCreatingFolder && (
                            <div className="w-full px-[0.85vw] py-[0.55vw] rounded-[0.5vw] border border-[#ec5137] bg-[#1c2636] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Folder Name..."
                                    value={newFolderInputName}
                                    onChange={(e) => setNewFolderInputName(e.target.value)}
                                    onBlur={saveNewFolder}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            saveNewFolder();
                                        }
                                        if (e.key === 'Escape') {
                                            setIsCreatingFolder(false);
                                            setNewFolderInputName('');
                                        }
                                    }}
                                    className="w-full text-[0.875vw] font-medium text-white bg-transparent focus:outline-none placeholder-gray-500"
                                />
                            </div>
                        )}

                        {/* Creating Folder Loading Row */}
                        {creatingFolderName && (
                            <div className="w-full flex items-center justify-between gap-[0.75vw] px-[0.85vw] py-[0.55vw] rounded-[0.5vw] border border-[#ec5137] bg-[#1c2636] text-[#ec5137] text-[0.875vw] font-medium shadow-sm animate-in fade-in duration-200">
                                <div className="flex items-center gap-[0.75vw] min-w-0 flex-1">
                                    <Folder size="1.15vw" className="text-[#ec5137] fill-current shrink-0" />
                                    <span className="truncate">{creatingFolderName}</span>
                                </div>
                                <div className="w-[1.1vw] h-[1.1vw] border-[2px] border-[#ec5137] border-t-transparent rounded-full animate-spin shrink-0"></div>
                            </div>
                        )}
                    </div>
                )}
                </CustomScrollbar>
            </div>

            {/* Storage & Upgrade Profile Card */}
            <div className="mt-auto relative z-30 pt-[0.6vw] flex-none">
                <div className="w-full bg-white rounded-[0.5vw] p-[0.8vw] border border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col select-none relative">
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

                        {!isUpgradeCardClosed && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsUpgradeCardClosed(true);
                                    try {
                                        localStorage.setItem('hide_upgrade_card', 'true');
                                        sessionStorage.setItem('hide_upgrade_card', 'true');
                                    } catch (err) {}
                                }}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-[0.2vw] rounded-full transition-colors cursor-pointer flex items-center justify-center -mr-[0.2vw] -mt-[0.2vw]"
                                title="Close Upgrade"
                                aria-label="Close Upgrade"
                            >
                                <X size="0.85vw" strokeWidth={2.2} />
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-[0.32vw] bg-[#e5e7eb] rounded-full overflow-hidden mb-[0.45vw]">
                        <div
                            className="h-full bg-[#ea543a] rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${storagePercent}%` }}
                        ></div>
                    </div>

                    {/* Storage Usage Stats */}
                    <div className="flex items-center justify-between text-[0.7vw] text-[#4b5563] font-semibold mb-[0.6vw]">
                        <span>
                            {isLoadingStorage ? 'Calculating...' : `${usedFormatted} of ${totalFormatted} used`}
                        </span>
                        <span className="text-[#374151] font-semibold">{storagePercent}%</span>
                    </div>

                    {/* Divider line & Upgrade Profile Button */}
                    {!isUpgradeCardClosed && (
                        <>
                            <div className="border-t border-[#f3f4f6] mb-[0.65vw]"></div>

                            <div className="relative">
                                {/* 3D Gold Crown */}
                                <div className="absolute -top-[1.05vw] -left-[0.5vw] w-[2.35vw] h-[1.88vw] -rotate-[16deg] z-20 select-none pointer-events-none drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)]">
                                    <svg viewBox="0 0 68 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                        <defs>
                                            <linearGradient id="goldGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#FFF7C2" />
                                                <stop offset="20%" stopColor="#FAD04C" />
                                                <stop offset="50%" stopColor="#E5A620" />
                                                <stop offset="80%" stopColor="#FCE082" />
                                                <stop offset="100%" stopColor="#A86B06" />
                                            </linearGradient>
                                            <linearGradient id="goldShine" x1="0%" y1="100%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#7A4B00" />
                                                <stop offset="35%" stopColor="#FFDE6A" />
                                                <stop offset="65%" stopColor="#CF8B13" />
                                                <stop offset="100%" stopColor="#FFFDF2" />
                                            </linearGradient>
                                            <radialGradient id="crownVelvet" cx="50%" cy="40%" r="60%">
                                                <stop offset="0%" stopColor="#8A151B" />
                                                <stop offset="70%" stopColor="#5E0B10" />
                                                <stop offset="100%" stopColor="#3B0508" />
                                            </radialGradient>
                                            <radialGradient id="rubyGem" cx="35%" cy="35%" r="65%">
                                                <stop offset="0%" stopColor="#FF6B6B" />
                                                <stop offset="40%" stopColor="#DC2626" />
                                                <stop offset="100%" stopColor="#7F1D1D" />
                                            </radialGradient>
                                            <radialGradient id="blueGem" cx="35%" cy="35%" r="65%">
                                                <stop offset="0%" stopColor="#60A5FA" />
                                                <stop offset="50%" stopColor="#2563EB" />
                                                <stop offset="100%" stopColor="#1E3A8A" />
                                            </radialGradient>
                                            <radialGradient id="emeraldGem" cx="35%" cy="35%" r="65%">
                                                <stop offset="0%" stopColor="#34D399" />
                                                <stop offset="50%" stopColor="#059669" />
                                                <stop offset="100%" stopColor="#064E3B" />
                                            </radialGradient>
                                            <radialGradient id="pearlSphere" cx="35%" cy="35%" r="65%">
                                                <stop offset="0%" stopColor="#FFFFFF" />
                                                <stop offset="60%" stopColor="#FFF3D6" />
                                                <stop offset="100%" stopColor="#D4A747" />
                                            </radialGradient>
                                        </defs>

                                        <path d="M 12 40 C 14 26, 54 26, 56 40 Z" fill="url(#crownVelvet)" opacity="0.9" />
                                        <path d="M 10 40 Q 34 20 34 11 Q 34 20 58 40" stroke="url(#goldGradMain)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                        <path d="M 7 42 Q 34 47 61 42 L 59 50 Q 34 54 9 50 Z" fill="url(#goldShine)" stroke="#7A4B00" strokeWidth="0.8" />
                                        <circle cx="16" cy="46.5" r="2" fill="url(#rubyGem)" stroke="#FFEAA7" strokeWidth="0.5" />
                                        <circle cx="28" cy="48" r="2" fill="url(#blueGem)" stroke="#FFEAA7" strokeWidth="0.5" />
                                        <circle cx="40" cy="48" r="2" fill="url(#rubyGem)" stroke="#FFEAA7" strokeWidth="0.5" />
                                        <circle cx="52" cy="46.5" r="2" fill="url(#emeraldGem)" stroke="#FFEAA7" strokeWidth="0.5" />
                                        <path d="M 7 42 L 3 19 L 20 30 L 34 11 L 48 30 L 65 19 L 61 42 Q 34 47 7 42 Z" fill="url(#goldGradMain)" stroke="#8A5A00" strokeWidth="0.9" />
                                        <path d="M 10 40 L 7 24 L 20 32 L 34 15 L 48 32 L 61 24 L 58 40 Q 34 44 10 40 Z" fill="url(#goldShine)" opacity="0.6" />
                                        <circle cx="3" cy="18" r="3.2" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                                        <circle cx="20" cy="29" r="2.8" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                                        <circle cx="34" cy="10" r="4.1" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                                        <circle cx="48" cy="29" r="2.8" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                                        <circle cx="65" cy="18" r="3.2" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                                        <polygon points="34,22 38.5,28 34,34 29.5,28" fill="url(#rubyGem)" stroke="#FFF3B0" strokeWidth="0.8" />
                                        <circle cx="20" cy="36" r="1.6" fill="url(#blueGem)" />
                                        <circle cx="48" cy="36" r="1.6" fill="url(#emeraldGem)" />
                                    </svg>
                                </div>

                                <button
                                    onClick={() => navigate('/settings/profile')}
                                    className="w-full relative overflow-hidden py-[0.52vw] px-[0.8vw] rounded-[0.65vw] text-[0.78vw] font-medium text-white flex items-center justify-center gap-[0.45vw] shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.35)] active:scale-[0.99] transition-all cursor-pointer group"
                                    style={{
                                        background: 'radial-gradient(ellipse at 50% 30%, #25282d 0%, #15171a 70%, #0d0e10 100%)'
                                    }}
                                >
                                    <span className="tracking-wide">Upgrade Profile</span>
                                    <ArrowRight size="0.85vw" strokeWidth={2.4} className="transition-transform group-hover:translate-x-[0.15vw]" />
                                </button>
                            </div>
                        </>
                    )}
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
                            const flipbookFolder = folders?.find(f => f.id === activeMenuId);
                            const threeDFolder = threeDFolders?.find(f => f.id === activeMenuId);
                            const folder = flipbookFolder || threeDFolder;
                            if (!folder) return null;
                            const is3d = Boolean(threeDFolder);

                            return (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(null);
                                            if (is3d) {
                                                startEditing3dFolder(folder);
                                            } else {
                                                startEditing(folder);
                                            }
                                        }}
                                        className="w-full flex items-center gap-[0.55vw] px-[0.8vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-200 hover:bg-[#2c3749] hover:text-white transition-colors border-b border-[#253346] group cursor-pointer"
                                    >
                                        <Edit2 size="0.88vw" className="text-gray-400 group-hover:text-white transition-colors shrink-0" />
                                        <span>Rename</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(null);
                                            if (is3d) {
                                                handleDuplicate3dFolder(folder);
                                            } else {
                                                handleDuplicateFolder(folder);
                                            }
                                        }}
                                        className="w-full flex items-center gap-[0.55vw] px-[0.8vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-200 hover:bg-[#2c3749] hover:text-white transition-colors border-b border-[#253346] group cursor-pointer"
                                    >
                                        <Copy size="0.88vw" className="text-gray-400 group-hover:text-white transition-colors shrink-0" />
                                        <span>Duplicate</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(null);
                                            if (is3d) {
                                                handleDelete3dFolder(folder);
                                            } else {
                                                handleDeleteFolderClick(folder);
                                            }
                                        }}
                                        className="w-full flex items-center gap-[0.55vw] px-[0.8vw] py-[0.625vw] text-[0.75vw] font-medium text-[#f87171] hover:bg-[#ef4444] hover:text-white transition-colors group cursor-pointer"
                                    >
                                        <Trash2 size="0.88vw" className="text-[#f87171] group-hover:text-white transition-colors shrink-0" />
                                        <span>Delete</span>
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                </>
            )}
        </aside>
    );
}
