import React from 'react';
import { Icon } from '@iconify/react';

/**
 * 3D Dark Studio Dropzone
 * Full width, increased height, using gis:cube-3d icon and exact hex colors.
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
      className={`w-full h-[23vw] min-h-[300px] rounded-[1vw] relative overflow-hidden select-none cursor-pointer transition-all duration-300 flex flex-col items-center justify-center flex-shrink-0 mb-[1vw] ${
        isDragging
          ? 'ring-2 ring-[#EA4724] shadow-[0_0_40px_rgba(234,71,36,0.35)]'
          : 'shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
      }`}
      style={{
        backgroundColor: '#1b1c20',
        backgroundImage: 'url(/3d-grid-bg.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay to ensure text readability & subtle glow */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-[20%] w-[20vw] h-[10vw] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center text-center px-[2vw]">
        {/* Top Prompt: #FFFFFF & #EA4724 */}
        <p className="text-[1.15vw] font-medium text-[#FFFFFF] tracking-wide mb-[1vw]">
          Drag & Drop or Click to{' '}
          <span className="text-[#EA4724] font-semibold underline underline-offset-4 hover:brightness-110 transition-all">
            Upload
          </span>
        </p>

        {/* Central 3D Coordinate / Cube Icon: gis:cube-3d */}
        <div className="w-[3.6vw] h-[3.6vw] flex items-center justify-center text-white transition-transform duration-300 hover:scale-110 mb-[1vw]">
          <Icon icon="gis:cube-3d" className="w-full h-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]" />
        </div>

        {/* Supported File Heading: #EA4724 */}
        <h4 className="text-[0.95vw] font-bold text-[#EA4724] tracking-wider uppercase mb-[0.35vw]">
          Supported File
        </h4>

        {/* File Formats List: #D9D9D9 */}
        <p className="text-[0.72vw] text-[#D9D9D9] font-medium tracking-widest uppercase">
          STEP, OBJ, FBX, GLB, GLTF, BLENDER, MAYA
        </p>
      </div>
    </div>
  );
}

