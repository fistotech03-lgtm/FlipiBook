import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
    Images,
    Image as ImageIcon,
    Video,
    Film,
    Music,
    Box,
    Sparkles,
    Search,
    ArrowDownUp,
    ChevronDown,
    Check,
    Eye,
    Trash2,
    Copy,
    Download,
    ExternalLink,
    LayoutGrid,
    List,
    X,
    UploadCloud,
    FolderOpen,
    Play,
    Volume2
} from 'lucide-react';
import CustomScrollbar from '../CustomScrollbar';
import { resolveUploadsPath } from '../../utils/assetUtils';

export default function GalleryScreen({
    navigate,
    user,
    emailId: propEmailId,
    backendUrl = import.meta.env.VITE_BACKEND_URL || ''
}) {
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortOption, setSortOption] = useState('Recently Added');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [groupByCategory, setGroupByCategory] = useState(true);

    // Preview Modal State
    const [previewAsset, setPreviewAsset] = useState(null);

    // Delete Modal State
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const sortDropdownRef = useRef(null);

    // Show temporary toast notification
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Close sort dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch user gallery assets
    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const userEmail = propEmailId || user?.emailId || user?.email;
            const res = await axios.get(`${backendUrl}/api/flipbook/get-gallery-assets`, {
                params: userEmail ? { emailId: userEmail } : {},
                withCredentials: true
            });

            if (res.data?.success && Array.isArray(res.data.assets)) {
                const normalized = res.data.assets.map((item) => {
                    const rawUrl = item.url || '';
                    const urlLower = rawUrl.toLowerCase();
                    const fileName = item.name || item.id || item.file_v_id || 'asset';

                    let detectedType = item.type || 'image';
                    if (urlLower.endsWith('.mp4') || urlLower.endsWith('.webm') || urlLower.endsWith('.mov') || urlLower.endsWith('.mkv')) {
                        detectedType = 'video';
                    } else if (urlLower.endsWith('.gif')) {
                        detectedType = 'gif';
                    } else if (urlLower.endsWith('.mp3') || urlLower.endsWith('.wav') || urlLower.endsWith('.ogg')) {
                        detectedType = 'audio';
                    } else if (urlLower.endsWith('.glb') || urlLower.endsWith('.gltf')) {
                        detectedType = '3d';
                    }

                    let categoryGroup = 'Images';
                    if (detectedType === 'video') categoryGroup = 'Videos';
                    else if (detectedType === 'gif') categoryGroup = 'GIFs';
                    else if (detectedType === 'audio') categoryGroup = 'Audio';
                    else if (detectedType === '3d') categoryGroup = '3D Models';
                    else if (item.category === 'Branding' || item.category === 'User Details') categoryGroup = 'Branding';

                    return {
                        id: item.id || item.convertedName || fileName,
                        file_v_id: item.file_v_id || item.id || fileName,
                        name: item.name || fileName,
                        fileName: item.name || fileName,
                        url: rawUrl,
                        fullUrl: resolveUploadsPath(rawUrl),
                        type: detectedType,
                        category: categoryGroup,
                        size: item.size || 0,
                        uploadedAt: item.uploadedAt || item.timestamp || item.createdAt || new Date()
                    };
                });
                setAssets(normalized);
            }
        } catch (err) {
            console.error('[GalleryScreen] Error fetching assets:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [propEmailId, user]);

    // Format bytes to KB / MB
    const formatSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateVal) => {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '';
        const day = d.getDate().toString().padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month}, ${year}`;
    };

    // Category Tabs definition
    const categories = [
        { id: 'all', label: 'All Assets', icon: Images },
        { id: 'Images', label: 'Images', icon: ImageIcon },
        { id: 'Videos', label: 'Videos', icon: Video },
        { id: 'GIFs', label: 'GIFs', icon: Film },
        { id: 'Audio', label: 'Audio', icon: Music },
        { id: '3D Models', label: '3D Models', icon: Box },
        { id: 'Branding', label: 'Branding', icon: Sparkles }
    ];

    // Counts per category
    const categoryCounts = useMemo(() => {
        const counts = { all: assets.length };
        categories.forEach((c) => {
            if (c.id !== 'all') {
                counts[c.id] = assets.filter((a) => a.category === c.id).length;
            }
        });
        return counts;
    }, [assets]);

    // Filter & Sort Assets
    const filteredAssets = useMemo(() => {
        let list = [...assets];

        // 1. Category Filter
        if (activeCategory !== 'all') {
            list = list.filter((a) => a.category === activeCategory);
        }

        // 2. Search Query Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((a) => (a.name || '').toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q));
        }

        // 3. Sorting
        list.sort((a, b) => {
            const dateA = new Date(a.uploadedAt).getTime() || 0;
            const dateB = new Date(b.uploadedAt).getTime() || 0;
            if (sortOption === 'Recently Added') return dateB - dateA;
            if (sortOption === 'Oldest First') return dateA - dateB;
            if (sortOption === 'Name (A-Z)') return (a.name || '').localeCompare(b.name || '');
            if (sortOption === 'Name (Z-A)') return (b.name || '').localeCompare(a.name || '');
            if (sortOption === 'Size (Largest)') return (b.size || 0) - (a.size || 0);
            if (sortOption === 'Size (Smallest)') return (a.size || 0) - (b.size || 0);
            return 0;
        });

        return list;
    }, [assets, activeCategory, searchQuery, sortOption]);

    // Group filtered assets category-wise
    const groupedAssets = useMemo(() => {
        if (!groupByCategory && activeCategory !== 'all') return null;
        const groups = {};
        const displayOrder = ['Images', 'Videos', 'GIFs', 'Audio', '3D Models', 'Branding'];

        displayOrder.forEach((cat) => {
            const items = filteredAssets.filter((a) => a.category === cat);
            if (items.length > 0) {
                groups[cat] = items;
            }
        });
        return groups;
    }, [filteredAssets, groupByCategory, activeCategory]);

    // Copy asset URL
    const handleCopyUrl = (url, name) => {
        const full = resolveUploadsPath(url);
        navigator.clipboard.writeText(full || url);
        showToast(`Copied link for "${name}"`);
    };

    // Download asset
    const handleDownload = (asset) => {
        const full = resolveUploadsPath(asset.url);
        const link = document.createElement('a');
        link.href = full;
        link.download = asset.name || 'asset';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Delete asset
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const userEmail = propEmailId || user?.emailId || user?.email;
            await axios.post(
                `${backendUrl}/api/page-editor/delete-gallery-asset`,
                {
                    emailId: userEmail,
                    url: deleteTarget.url,
                    fileName: deleteTarget.fileName || deleteTarget.name,
                    file_v_id: deleteTarget.file_v_id
                },
                { withCredentials: true }
            );

            // Also attempt customized-editor delete for complete cleanliness
            await axios
                .post(
                    `${backendUrl}/api/customized-editor/delete-customized-asset`,
                    {
                        url: deleteTarget.url,
                        fileName: deleteTarget.fileName || deleteTarget.name,
                        assetId: deleteTarget.id
                    },
                    { withCredentials: true }
                )
                .catch(() => {});

            setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id && a.url !== deleteTarget.url));
            window.dispatchEvent(new CustomEvent('flipibook_storage_updated'));
            showToast('Asset deleted successfully');
            setDeleteTarget(null);
        } catch (err) {
            console.error('[GalleryScreen] Error deleting asset:', err);
            showToast('Failed to delete asset. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper to detect file type from file name/extension
    const detectFileType = (file) => {
        const name = (file.name || '').toLowerCase();
        if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov') || name.endsWith('.mkv')) {
            return 'video';
        }
        if (name.endsWith('.gif')) {
            return 'gif';
        }
        if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg')) {
            return 'audio';
        }
        if (name.endsWith('.glb') || name.endsWith('.gltf')) {
            return '3d';
        }
        return 'image';
    };

    // Execute upload of multiple files
    const executeUpload = async (fileList) => {
        if (!fileList || fileList.length === 0) return;
        const filesArray = Array.from(fileList);
        setIsUploading(true);
        setUploadProgress({ current: 0, total: filesArray.length });

        const userEmail = propEmailId || user?.emailId || user?.email;
        let successCount = 0;

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            const detectedType = detectFileType(file);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('isGallery', 'true');
            formData.append('type', detectedType);
            if (userEmail) formData.append('emailId', userEmail);

            try {
                const res = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });
                if (res.data?.success) {
                    successCount++;
                }
            } catch (err) {
                console.error('[GalleryScreen] Error uploading file:', file.name, err);
            }
            setUploadProgress({ current: i + 1, total: filesArray.length });
        }

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (successCount > 0) {
            showToast(`Successfully uploaded ${successCount} asset${successCount > 1 ? 's' : ''}`);
            await fetchAssets();
            window.dispatchEvent(new CustomEvent('flipibook_storage_updated'));
        } else {
            showToast('Failed to upload selected file(s)');
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            executeUpload(e.target.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            executeUpload(e.dataTransfer.files);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex-1 w-full h-full flex flex-col min-h-0 bg-[#f8f9fb] relative select-none"
        >
            {/* Hidden File Input for Direct Upload */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.gif,.glb,.gltf"
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Drag & Drop Full Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-blue-600/10 backdrop-blur-2xs border-2 border-dashed border-blue-500 rounded-xl flex flex-col items-center justify-center p-8 pointer-events-none animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg mb-3 animate-bounce">
                        <UploadCloud size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900 mb-1">Drop files here to upload to Gallery</h3>
                    <p className="text-xs text-blue-700">Images, Videos, GIFs, Audio, and 3D Models (.glb, .gltf)</p>
                </div>
            )}

            {/* Uploading Progress Floating Notification */}
            {isUploading && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-slide-up">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <div className="text-xs">
                        <p className="font-semibold">Uploading Media to Gallery...</p>
                        <p className="text-gray-400 text-[11px]">
                            {uploadProgress.current} of {uploadProgress.total} file(s) processed
                        </p>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#1e293b] text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center gap-2 border border-gray-700 animate-fade-in">
                    <Check size={16} className="text-[#059669]" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header & Controls Toolbar */}
            <div className="flex-none p-[1vw] pb-0">
                {/* Title & Stats */}
                <div className="flex items-center justify-between mb-[0.8vw]">
                    <div className="flex items-center gap-[0.75vw]">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-xs">
                            <Images className="w-5 h-5 text-[#2563eb]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-[1.25vw] font-bold text-gray-900 tracking-tight">My Gallery</h1>
                                <span className="px-2 py-0.5 text-[0.75vw] font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                                    {assets.length} Assets
                                </span>
                            </div>
                            <p className="text-[0.75vw] text-gray-500">
                                Browse, preview, and manage your uploaded media assets categorized across your workspace.
                            </p>
                        </div>
                    </div>

                    {/* View Controls & Action */}
                    <div className="flex items-center gap-[0.6vw]">
                        {/* Group Category Toggle (visible when All is selected) */}
                        {activeCategory === 'all' && (
                            <button
                                onClick={() => setGroupByCategory(!groupByCategory)}
                                className={`px-3 py-1.5 rounded-lg text-[0.75vw] font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                                    groupByCategory
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <FolderOpen size={14} />
                                <span>Group by Category</span>
                            </button>
                        )}

                        {/* Grid / List Switcher */}
                        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid size={15} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                                }`}
                                title="List View"
                            >
                                <List size={15} />
                            </button>
                        </div>

                        {/* Direct Upload Media Button */}
                        <button
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-1.5 rounded-lg text-[0.78vw] font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                            <UploadCloud size={15} />
                            <span>{isUploading ? 'Uploading...' : 'Upload Media'}</span>
                        </button>
                    </div>
                </div>

                {/* Search & Sort Filters Bar */}
                <div className="flex items-center justify-between gap-3 mb-[0.8vw]">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-[24vw]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by asset name or format..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-[0.8vw] text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative" ref={sortDropdownRef}>
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[0.8vw] text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
                        >
                            <ArrowDownUp size={14} className="text-gray-400" />
                            <span>Sort: {sortOption}</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>

                        {isSortOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 animate-fade-in text-[0.78vw]">
                                {[
                                    'Recently Added',
                                    'Oldest First',
                                    'Name (A-Z)',
                                    'Name (Z-A)',
                                    'Size (Largest)',
                                    'Size (Smallest)'
                                ].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setSortOption(opt);
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                                            sortOption === opt ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-gray-700'
                                        }`}
                                    >
                                        <span>{opt}</span>
                                        {sortOption === opt && <Check size={14} className="text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Navigation Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-none">
                    {categories.map((cat) => {
                        const IconComponent = cat.icon;
                        const count = categoryCounts[cat.id] || 0;
                        const isActive = activeCategory === cat.id;

                        // Only show non-zero categories or 'all'
                        if (cat.id !== 'all' && count === 0) return null;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[0.78vw] font-medium transition-all shrink-0 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#1e293b] text-white shadow-xs'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <IconComponent size={14} className={isActive ? 'text-white' : 'text-gray-500'} />
                                <span>{cat.label}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[0.68vw] ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-[1vw] pt-3">
                <CustomScrollbar>
                    {isLoading ? (
                        /* Loading Skeleton Grid */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Array.from({ length: 12 }).map((_, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                                    <div className="w-full h-36 bg-gray-200" />
                                    <div className="p-3 space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 border border-blue-100 shadow-2xs">
                                <Images className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                                {searchQuery ? 'No matching assets found' : 'No assets in this category'}
                            </h3>
                            <p className="text-xs text-gray-500 max-w-sm mb-4">
                                {searchQuery
                                    ? `No assets match "${searchQuery}". Try clearing search or selecting a different category.`
                                    : 'Media uploaded inside your flipbooks, Page Editor, or Customized Editor will appear here automatically.'}
                            </p>
                            {searchQuery ? (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="px-3.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Clear Search
                                </button>
                            ) : (
                                <button
                                    disabled={isUploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    <UploadCloud size={16} />
                                    <span>Upload Media to Gallery</span>
                                </button>
                            )}
                        </div>
                    ) : activeCategory === 'all' && groupByCategory && groupedAssets ? (
                        /* CATEGORY-WISE GROUPED VIEW */
                        <div className="space-y-6">
                            {Object.entries(groupedAssets).map(([catName, catItems]) => (
                                <div key={catName} className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
                                    {/* Category Section Header */}
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            {catName === 'Images' && <ImageIcon size={18} className="text-blue-500" />}
                                            {catName === 'Videos' && <Video size={18} className="text-purple-500" />}
                                            {catName === 'GIFs' && <Film size={18} className="text-pink-500" />}
                                            {catName === 'Audio' && <Music size={18} className="text-amber-500" />}
                                            {catName === '3D Models' && <Box size={18} className="text-emerald-500" />}
                                            {catName === 'Branding' && <Sparkles size={18} className="text-indigo-500" />}
                                            <h2 className="text-sm font-bold text-gray-900">{catName}</h2>
                                            <span className="px-2 py-0.5 text-[0.7vw] font-medium bg-gray-100 text-gray-600 rounded-full">
                                                {catItems.length}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setActiveCategory(catName)}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                                        >
                                            View all {catName.toLowerCase()} &rarr;
                                        </button>
                                    </div>

                                    {/* Category Items */}
                                    {viewMode === 'grid' ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                                            {catItems.map((asset) => (
                                                <AssetCard
                                                    key={asset.id}
                                                    asset={asset}
                                                    formatSize={formatSize}
                                                    formatDate={formatDate}
                                                    onPreview={() => setPreviewAsset(asset)}
                                                    onCopy={() => handleCopyUrl(asset.url, asset.name)}
                                                    onDownload={() => handleDownload(asset)}
                                                    onDelete={() => setDeleteTarget(asset)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <AssetListView
                                            assets={catItems}
                                            formatSize={formatSize}
                                            formatDate={formatDate}
                                            onPreview={(a) => setPreviewAsset(a)}
                                            onCopy={(a) => handleCopyUrl(a.url, a.name)}
                                            onDownload={(a) => handleDownload(a)}
                                            onDelete={(a) => setDeleteTarget(a)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* UNGROUPED VIEW (Single Category or Group Toggle Off) */
                        <div>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                                    {filteredAssets.map((asset) => (
                                        <AssetCard
                                            key={asset.id}
                                            asset={asset}
                                            formatSize={formatSize}
                                            formatDate={formatDate}
                                            onPreview={() => setPreviewAsset(asset)}
                                            onCopy={() => handleCopyUrl(asset.url, asset.name)}
                                            onDownload={() => handleDownload(asset)}
                                            onDelete={() => setDeleteTarget(asset)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <AssetListView
                                    assets={filteredAssets}
                                    formatSize={formatSize}
                                    formatDate={formatDate}
                                    onPreview={(a) => setPreviewAsset(a)}
                                    onCopy={(a) => handleCopyUrl(a.url, a.name)}
                                    onDownload={(a) => handleDownload(a)}
                                    onDelete={(a) => setDeleteTarget(a)}
                                />
                            )}
                        </div>
                    )}
                </CustomScrollbar>
            </div>

            {/* PREVIEW MODAL */}
            {previewAsset && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setPreviewAsset(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
                            <div className="flex items-center gap-2 overflow-hidden pr-4">
                                <span className="px-2 py-0.5 text-xs font-semibold uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                    {previewAsset.category}
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900 truncate" title={previewAsset.name}>
                                    {previewAsset.name}
                                </h3>
                            </div>
                            <button
                                onClick={() => setPreviewAsset(null)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Media Display */}
                        <div className="flex-1 min-h-[300px] max-h-[55vh] bg-[#0f172a] flex items-center justify-center overflow-hidden relative">
                            {previewAsset.type === 'video' ? (
                                <video
                                    src={previewAsset.fullUrl}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : previewAsset.type === 'audio' ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-white">
                                    <div className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-500 flex items-center justify-center mb-4">
                                        <Volume2 className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <p className="text-sm font-medium mb-3">{previewAsset.name}</p>
                                    <audio src={previewAsset.fullUrl} controls className="w-80" />
                                </div>
                            ) : previewAsset.type === '3d' ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-white">
                                    <Box className="w-16 h-16 text-emerald-400 mb-3 animate-bounce" />
                                    <p className="text-sm font-semibold mb-1">3D Model Asset</p>
                                    <p className="text-xs text-gray-400 mb-4">{previewAsset.name}</p>
                                    <a
                                        href={previewAsset.fullUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <ExternalLink size={14} /> Open in 3D Viewer
                                    </a>
                                </div>
                            ) : (
                                <img
                                    src={previewAsset.fullUrl}
                                    alt={previewAsset.name}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder.png';
                                    }}
                                />
                            )}
                        </div>

                        {/* Modal Footer / Metadata */}
                        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center gap-4">
                                <span>Size: <strong>{formatSize(previewAsset.size)}</strong></span>
                                <span>Uploaded: <strong>{formatDate(previewAsset.uploadedAt)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCopyUrl(previewAsset.url, previewAsset.name)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-1.5 transition-colors"
                                >
                                    <Copy size={13} /> Copy Link
                                </button>
                                <button
                                    onClick={() => handleDownload(previewAsset)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-1.5 transition-colors"
                                >
                                    <Download size={13} /> Download
                                </button>
                                <button
                                    onClick={() => {
                                        setDeleteTarget(previewAsset);
                                        setPreviewAsset(null);
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-medium flex items-center gap-1.5 transition-colors"
                                >
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => !isDeleting && setDeleteTarget(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 text-center animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100">
                            <Trash2 size={22} />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Delete Asset?</h3>
                        <p className="text-xs text-gray-500 mb-4 px-2">
                            Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteTarget.name}"</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={isDeleting}
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Grid View Asset Card
 */
function AssetCard({ asset, formatSize, formatDate, onPreview, onCopy, onDownload, onDelete }) {
    const isVideo = asset.type === 'video';
    const isGif = asset.type === 'gif';
    const isAudio = asset.type === 'audio';
    const is3d = asset.type === '3d';

    return (
        <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-md transition-all flex flex-col relative">
            {/* Media Thumbnail Container */}
            <div
                onClick={onPreview}
                className="w-full h-32 bg-[#0f172a]/5 flex items-center justify-center relative overflow-hidden cursor-pointer"
            >
                {isVideo ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
                        <video
                            src={asset.fullUrl}
                            className="w-full h-full object-cover opacity-80"
                            muted
                            preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                                <Play size={14} className="text-gray-900 ml-0.5 fill-gray-900" />
                            </div>
                        </div>
                    </div>
                ) : isAudio ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50/50 p-2">
                        <Music className="w-10 h-10 text-amber-500 mb-1" />
                        <span className="text-[0.65vw] font-medium text-amber-700">Audio Track</span>
                    </div>
                ) : is3d ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50/50 p-2">
                        <Box className="w-10 h-10 text-emerald-500 mb-1" />
                        <span className="text-[0.65vw] font-medium text-emerald-700">3D GLB/GLTF</span>
                    </div>
                ) : (
                    <img
                        src={asset.fullUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.png';
                        }}
                    />
                )}

                {/* Top Badge: Type / Format */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                    <span className="px-1.5 py-0.5 text-[0.6vw] font-bold uppercase rounded bg-black/60 text-white backdrop-blur-xs">
                        {asset.type}
                    </span>
                    {isGif && (
                        <span className="px-1 py-0.5 text-[0.6vw] font-bold uppercase rounded bg-pink-600 text-white">
                            GIF
                        </span>
                    )}
                </div>

                {/* Hover Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPreview();
                        }}
                        className="p-1.5 rounded-full bg-white/90 text-gray-800 hover:bg-white hover:scale-110 transition-all shadow-md"
                        title="Quick Preview"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopy();
                        }}
                        className="p-1.5 rounded-full bg-white/90 text-gray-800 hover:bg-white hover:scale-110 transition-all shadow-md"
                        title="Copy Link"
                    >
                        <Copy size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownload();
                        }}
                        className="p-1.5 rounded-full bg-white/90 text-gray-800 hover:bg-white hover:scale-110 transition-all shadow-md"
                        title="Download Asset"
                    >
                        <Download size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all shadow-md"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Asset Metadata Footer */}
            <div className="p-2.5 flex-1 flex flex-col justify-between bg-white">
                <p className="text-[0.75vw] font-medium text-gray-900 truncate" title={asset.name}>
                    {asset.name}
                </p>
                <div className="flex items-center justify-between text-[0.68vw] text-gray-400 mt-1">
                    <span>{formatSize(asset.size)}</span>
                    <span>{formatDate(asset.uploadedAt)}</span>
                </div>
            </div>
        </div>
    );
}

/**
 * List / Table View
 */
function AssetListView({ assets, formatSize, formatDate, onPreview, onCopy, onDownload, onDelete }) {
    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[0.7vw]">
                    <tr>
                        <th className="py-2.5 px-4">Asset</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Size</th>
                        <th className="py-2.5 px-4">Uploaded Date</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[0.75vw]">
                    {assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-gray-50/80 transition-colors group">
                            <td className="py-2 px-4 flex items-center gap-3">
                                <div
                                    onClick={() => onPreview(asset)}
                                    className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 cursor-pointer border border-gray-200"
                                >
                                    {asset.type === 'video' ? (
                                        <Video size={16} className="text-purple-600" />
                                    ) : asset.type === 'audio' ? (
                                        <Music size={16} className="text-amber-600" />
                                    ) : asset.type === '3d' ? (
                                        <Box size={16} className="text-emerald-600" />
                                    ) : (
                                        <img src={asset.fullUrl} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <span className="font-medium text-gray-900 truncate max-w-xs" title={asset.name}>
                                    {asset.name}
                                </span>
                            </td>
                            <td className="py-2 px-4">
                                <span className="px-2 py-0.5 rounded-full text-[0.68vw] bg-gray-100 text-gray-700 font-medium">
                                    {asset.category}
                                </span>
                            </td>
                            <td className="py-2 px-4 uppercase text-gray-400 font-semibold text-[0.7vw]">
                                {asset.type}
                            </td>
                            <td className="py-2 px-4">{formatSize(asset.size)}</td>
                            <td className="py-2 px-4 text-gray-500">{formatDate(asset.uploadedAt)}</td>
                            <td className="py-2 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                                    <button
                                        onClick={() => onPreview(asset)}
                                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                                        title="Preview"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        onClick={() => onCopy(asset)}
                                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                                        title="Copy Link"
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button
                                        onClick={() => onDownload(asset)}
                                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                                        title="Download"
                                    >
                                        <Download size={14} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(asset)}
                                        className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

