import React from 'react';

/**
 * 3D Dark Studio Dropzone matching Screenshot 1
 * Features a dark 3D perspective viewport with isometric wireframe cube,
 * grid floor with perspective vanishing lines, and center upload triggers.
 */
export default function ThreeDUploadHero({
  onFileSelect,
  isDragging,
  setIsDragging,
  onClick
}) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
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
    if (e.dataTransfer?.files?.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full h-[19vw] min-h-[260px] rounded-[1vw] relative overflow-hidden select-none cursor-pointer transition-all duration-300 flex flex-col items-center justify-center flex-shrink-0 mb-[0.9vw] ${
        isDragging
          ? 'ring-2 ring-[#ec5137] shadow-[0_0_40px_rgba(236,81,55,0.3)]'
          : 'shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #363942 0%, #202227 60%, #16181c 100%)'
      }}
    >
      {/* 3D Perspective Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          perspective: '600px',
          perspectiveOrigin: '50% 40%'
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: 'rotateX(68deg) translateY(2vw)',
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '2.5vw 2.5vw',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 80%)'
          }}
        />

        {/* Axis center guide lines */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/20" />
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-emerald-500/20" />
      </div>

      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-[20%] w-[20vw] h-[10vw] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center text-center px-[2vw]">
        {/* Top Prompt */}
        <p className="text-[1.1vw] font-medium text-slate-300 tracking-wide mb-[1.2vw]">
          Drag & Drop or Click to{' '}
          <span className="text-[#ec5137] font-semibold underline underline-offset-4 hover:text-[#ff6b52] transition-colors">
            Upload
          </span>
        </p>

        {/* Central 3D Coordinate / Cube Wireframe Icon */}
        <div className="w-[3.6vw] h-[3.6vw] flex items-center justify-center text-slate-200 transition-transform duration-300 hover:scale-110 mb-[1.1vw]">
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Center axes rays */}
            <circle cx="32" cy="32" r="2.5" fill="currentColor" />
            <line x1="32" y1="32" x2="32" y2="8" stroke="currentColor" strokeWidth="1.8" />
            <line x1="32" y1="32" x2="11" y2="44" stroke="currentColor" strokeWidth="1.8" />
            <line x1="32" y1="32" x2="53" y2="44" stroke="currentColor" strokeWidth="1.8" />

            {/* Wireframe isometric cube outer box */}
            <path d="M32 14 L50 24.5 L50 45.5 L32 56 L14 45.5 L14 24.5 Z" stroke="currentColor" strokeWidth="1.6" opacity="0.9" />
            
            {/* Inner isometric planes */}
            <line x1="32" y1="14" x2="32" y2="35" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            <line x1="14" y1="24.5" x2="32" y2="35" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            <line x1="50" y1="24.5" x2="32" y2="35" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />

            {/* Inner small axes indicators */}
            <circle cx="32" cy="8" r="1.5" fill="#ec5137" stroke="none" />
            <circle cx="11" cy="44" r="1.5" fill="#10b981" stroke="none" />
            <circle cx="53" cy="44" r="1.5" fill="#3b82f6" stroke="none" />
          </svg>
        </div>

        {/* Supported File Heading */}
        <h4 className="text-[0.95vw] font-bold text-[#ec5137] tracking-wider uppercase mb-[0.2vw]">
          Supported File
        </h4>

        {/* File Formats List */}
        <p className="text-[0.68vw] text-slate-400 font-semibold tracking-widest uppercase">
          STEP, OBJ, FBX, GLB, GLTF, BLENDER, MAYA
        </p>
      </div>
    </div>
  );
}

