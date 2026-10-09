import React, { useRef, useState } from 'react';
import { ArrowRight, Eye, MoreVertical, Check } from 'lucide-react';
import { Icon } from '@iconify/react';
import CustomScrollbar from '../CustomScrollbar';

// Default dummy 3D models matching the reference screenshot
const DUMMY_3D_MODELS = [
    {
        id: '1',
        title: 'Sports Bike',
        format: 'GLB',
        size: '24.5 MB',
        category: 'Vehicles',
        badgeBg: 'bg-[#fee2e2]',
        badgeText: 'text-[#ef4444]',
        iconName: 'solar:wheel-bold',
        accentColor: '#ef4444'
    },
    {
        id: '2',
        title: 'Centrifugal Pump',
        format: 'GLTF',
        size: '12.8 MB',
        category: 'Pumps',
        badgeBg: 'bg-[#e0f2fe]',
        badgeText: 'text-[#0284c7]',
        iconName: 'solar:water-pump-bold',
        accentColor: '#0284c7'
    },
    {
        id: '3',
        title: 'Electric Motor',
        format: 'OBJ',
        size: '8.4 MB',
        category: 'Motors',
        badgeBg: 'bg-[#fef3c7]',
        badgeText: 'text-[#d97706]',
        iconName: 'solar:bolt-bold',
        accentColor: '#d97706'
    },
    {
        id: '4',
        title: 'Modern Chair',
        format: 'GLB',
        size: '5.2 MB',
        category: 'Furniture',
        badgeBg: 'bg-[#f3e8ff]',
        badgeText: 'text-[#9333ea]',
        iconName: 'solar:armchair-bold',
        accentColor: '#9333ea'
    },
    {
        id: '5',
        title: 'Villa Model',
        format: 'FBX',
        size: '36.1 MB',
        category: 'Architecture',
        badgeBg: 'bg-[#e0f2fe]',
        badgeText: 'text-[#0284c7]',
        iconName: 'solar:home-bold',
        accentColor: '#0284c7'
    }
];

export default function ThreeDDashboard({
    navigate,
    onUploadModel,
    onAddToFlipbook,
    activeFolder = 'All Models'
}) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [models, setModels] = useState(DUMMY_3D_MODELS);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [addedIds, setAddedIds] = useState([]);

    const displayedModels = models.filter(m => {
        if (!activeFolder || activeFolder === 'All Models' || activeFolder === 'Recent') return true;
        return m.category.toLowerCase().includes(activeFolder.toLowerCase()) || activeFolder.toLowerCase().includes(m.category.toLowerCase());
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newModel = {
            id: Date.now().toString(),
            title: files[0].name.replace(/\.[^/.]+$/, ''),
            format: (files[0].name.split('.').pop() || 'GLB').toUpperCase(),
            size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`,
            category: 'Custom',
            badgeBg: 'bg-orange-50',
            badgeText: 'text-[#ea543a]',
            iconName: 'solar:box-bold',
            accentColor: '#ea543a'
        };
        setModels(prev => [newModel, ...prev]);
        if (onUploadModel) onUploadModel(files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) {
            const newModel = {
                id: Date.now().toString(),
                title: files[0].name.replace(/\.[^/.]+$/, ''),
                format: (files[0].name.split('.').pop() || 'GLB').toUpperCase(),
                size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`,
                category: 'Custom',
                badgeBg: 'bg-orange-50',
                badgeText: 'text-[#ea543a]',
                iconName: 'solar:box-bold',
                accentColor: '#ea543a'
            };
            setModels(prev => [newModel, ...prev]);
            if (onUploadModel) onUploadModel(files[0]);
        }
    };

    const handleAddClick = (id) => {
        setAddedIds(prev => [...prev, id]);
        setTimeout(() => {
            setAddedIds(prev => prev.filter(item => item !== id));
        }, 2000);
        if (onAddToFlipbook) onAddToFlipbook(id);
    };

    return (
        <div className="flex-1 flex flex-col select-none h-full overflow-hidden">
            {/* Top 3D Viewport / Upload Area (Matching FlipbooksBanner exact dimensions) */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`w-full h-[11.4vw] min-h-[11.4vw] max-h-[11.4vw] flex-shrink-0 rounded-[1.2vw] mb-[0.95vw] relative overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all border shadow-[0_4px_24px_rgba(0,0,0,0.18)] ${
                    isDragging ? 'border-[#ec5137] ring-2 ring-[#ec5137]/30' : 'border-[#1e2738] hover:border-[#ec5137]/50'
                } bg-[#141a24] group select-none`}
                style={{
                    background: `
                        radial-gradient(circle at 50% 50%, #1a2232 0%, #111620 100%)
                    `
                }}
            >
                {/* 3D Perspective Grid Background */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-40 transition-opacity"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: '2.5vw 2.5vw',
                        transform: 'perspective(400px) rotateX(45deg) translateY(20%) scale(1.6)',
                        transformOrigin: 'center bottom'
                    }}
                />

                {/* Subtle coordinate ground axis lines */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-px bg-red-500/25 absolute"></div>
                    <div className="h-full w-px bg-green-500/25 absolute"></div>
                </div>

                {/* Upload Content in Center */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-[2vw]">
                    {/* Header: Drag & Drop or Click to Upload */}
                    <p className="text-[0.88vw] text-gray-200 font-medium mb-[0.45vw] group-hover:text-white transition-colors">
                        Drag & Drop or Click to <span className="text-[#ec5137] font-semibold">Upload</span>
                    </p>

                    {/* 3D Wireframe Coordinate Gizmo Icon */}
                    <div className="w-[3vw] h-[3vw] flex items-center justify-center mb-[0.45vw] transition-transform duration-300 group-hover:scale-110">
                        <svg
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-[2.6vw] h-[2.6vw] text-white/90 drop-shadow-[0_4px_12px_rgba(236,81,55,0.25)]"
                        >
                            {/* Outer wireframe cube */}
                            <path
                                d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                            />
                            {/* Inner isometric lines meeting at center */}
                            <path
                                d="M24 24L42 14M24 24L6 14M24 24V44"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                            />
                            {/* Central coordinate node */}
                            <circle cx="24" cy="24" r="2.2" fill="#ec5137" />
                            {/* Sub axes dots */}
                            <circle cx="24" cy="4" r="1.5" fill="#38bdf8" />
                            <circle cx="42" cy="14" r="1.5" fill="#ef4444" />
                            <circle cx="6" cy="14" r="1.5" fill="#10b981" />
                            <circle cx="24" cy="44" r="1.5" fill="#f59e0b" />
                        </svg>
                    </div>

                    {/* Supported File Label */}
                    <p className="text-[#ec5137] font-semibold text-[0.8vw] mb-[0.15vw] tracking-wide">
                        Supported File
                    </p>

                    {/* Format Extensions */}
                    <p className="text-gray-400 text-[0.65vw] font-normal tracking-wider uppercase">
                        STEP, OBJ, FBX, GLB, GLTF, BLENDER, MAYA
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".glb,.gltf,.fbx,.obj,.step,.blend,.ma,.mb"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Bottom White Container: Recent 3D Models */}
            <div className="w-full bg-white rounded-[1.2vw] p-[1.1vw] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex-1 flex flex-col min-h-0">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-[0.9vw] flex-none">
                    <h2 className="text-[1.1vw] font-bold text-[#1f2937]">Recent 3D Models</h2>
                    <button
                        onClick={() => {}}
                        className="text-[0.78vw] font-semibold text-[#ec5137] hover:opacity-80 transition-opacity flex items-center gap-[0.3vw] cursor-pointer"
                    >
                        <span>View All</span>
                        <ArrowRight size="0.75vw" />
                    </button>
                </div>

                {/* Cards Row */}
                <CustomScrollbar
                    color="#ec5137"
                    hoverColor="#d64129"
                    width="0.35vw"
                    className="flex-1 grid grid-cols-5 gap-[1vw] min-h-0 pb-[0.4vw]"
                >
                    {displayedModels.map((model) => {
                        const isAdded = addedIds.includes(model.id);

                        return (
                            <div
                                key={model.id}
                                className="bg-white rounded-[0.7vw] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md p-[0.75vw] flex flex-col justify-between transition-all group relative"
                            >
                                {/* Top: 3-dots Menu */}
                                <div className="flex justify-end mb-[0.3vw] relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === model.id ? null : model.id);
                                        }}
                                        className="w-[1.4vw] h-[1.4vw] rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                    >
                                        <MoreVertical size="0.85vw" />
                                    </button>

                                    {/* Action Dropdown Menu */}
                                    {activeMenuId === model.id && (
                                        <div
                                            className="absolute right-0 top-[1.6vw] w-[9vw] bg-white rounded-[0.5vw] shadow-xl border border-gray-100 py-[0.3vw] z-30 animate-in fade-in zoom-in-95 duration-150"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => {
                                                    setActiveMenuId(null);
                                                    if (navigate) navigate('/editor/threed_editor');
                                                }}
                                                className="w-full px-[0.7vw] py-[0.35vw] text-left text-[0.72vw] text-gray-700 hover:bg-gray-50 flex items-center gap-[0.4vw]"
                                            >
                                                <Icon icon="solar:pen-new-square-linear" className="w-[0.85vw] h-[0.85vw]" />
                                                Edit in 3D Editor
                                            </button>
                                            <button
                                                onClick={() => setActiveMenuId(null)}
                                                className="w-full px-[0.7vw] py-[0.35vw] text-left text-[0.72vw] text-gray-700 hover:bg-gray-50 flex items-center gap-[0.4vw]"
                                            >
                                                <Icon icon="solar:download-linear" className="w-[0.85vw] h-[0.85vw]" />
                                                Download
                                            </button>
                                            <div className="h-px bg-gray-100 my-[0.2vw]"></div>
                                            <button
                                                onClick={() => {
                                                    setModels(prev => prev.filter(m => m.id !== model.id));
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full px-[0.7vw] py-[0.35vw] text-left text-[0.72vw] text-red-600 hover:bg-red-50 flex items-center gap-[0.4vw]"
                                            >
                                                <Icon icon="solar:trash-bin-trash-linear" className="w-[0.85vw] h-[0.85vw]" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Model Dummy 3D Preview Box */}
                                <div className="w-full aspect-[4/3] rounded-[0.55vw] bg-gradient-to-b from-gray-50 to-gray-100/80 flex items-center justify-center p-[0.7vw] relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                                    {/* Stylized Dummy 3D Object Illustration */}
                                    <div
                                        className="w-[4.8vw] h-[4.8vw] rounded-[0.7vw] flex items-center justify-center shadow-xs transition-transform group-hover:rotate-3"
                                        style={{ backgroundColor: `${model.accentColor || '#ea543a'}15` }}
                                    >
                                        <Icon
                                            icon={model.iconName || 'solar:box-bold-duotone'}
                                            className="w-[2.6vw] h-[2.6vw] transition-transform group-hover:scale-110"
                                            style={{ color: model.accentColor || '#ea543a' }}
                                        />
                                    </div>

                                    {/* Subtle 3D Tag */}
                                    <div className="absolute bottom-[0.3vw] right-[0.4vw] px-[0.4vw] py-[0.1vw] rounded-[0.2vw] bg-white/80 backdrop-blur-xs text-[0.55vw] font-bold text-gray-500 shadow-2xs">
                                        3D
                                    </div>
                                </div>

                                {/* Model Details */}
                                <div className="mt-[0.6vw] mb-[0.6vw]">
                                    <h3 className="text-[0.84vw] font-bold text-[#1f2937] leading-tight truncate" title={model.title}>
                                        {model.title}
                                    </h3>
                                    <p className="text-[0.65vw] text-gray-400 font-normal mt-[0.15vw]">
                                        {model.format} • {model.size}
                                    </p>
                                    {/* Category Pill */}
                                    <div className="mt-[0.4vw]">
                                        <span className={`inline-block px-[0.55vw] py-[0.12vw] rounded-full text-[0.62vw] font-medium ${model.badgeBg} ${model.badgeText}`}>
                                            {model.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Buttons: View & Add to Flipbook */}
                                <div className="flex items-center gap-[0.4vw] pt-[0.2vw]">
                                    <button
                                        onClick={() => {
                                            if (navigate) navigate('/editor/threed_editor');
                                        }}
                                        className="flex-1 py-[0.35vw] px-[0.4vw] rounded-[0.4vw] border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-[0.68vw] font-medium flex items-center justify-center gap-[0.3vw] transition-all cursor-pointer shadow-2xs"
                                    >
                                        <Eye size="0.75vw" />
                                        <span>View</span>
                                    </button>

                                    <button
                                        onClick={() => handleAddClick(model.id)}
                                        className={`flex-1 py-[0.35vw] px-[0.4vw] rounded-[0.4vw] text-white text-[0.68vw] font-medium flex items-center justify-center gap-[0.2vw] transition-all cursor-pointer shadow-2xs ${
                                            isAdded
                                                ? 'bg-emerald-600'
                                                : 'bg-[#ec5137] hover:bg-[#d64129]'
                                        }`}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check size="0.75vw" />
                                                <span>Added</span>
                                            </>
                                        ) : (
                                            <span>+ Add to Flipbook</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </CustomScrollbar>
            </div>
        </div>
    );
}
