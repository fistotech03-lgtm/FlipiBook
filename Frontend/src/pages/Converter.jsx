import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import {
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Footer from './Footer';
import ConverterWorkspace from './Converter/ConverterWorkspace';
import { preloadBackgroundRemovalModel } from './Converter/backgroundRemovalService';

// Maximum recommended file sizes to ensure smooth browser performance without memory crashes
const MAX_FILE_SIZES = {
  image: { bytes: 25 * 1024 * 1024, label: '25 MB' },
  video: { bytes: 100 * 1024 * 1024, label: '100 MB' },
  threed: { bytes: 60 * 1024 * 1024, label: '60 MB' }
};

// The 3 Media Types to Convert & Compress
const MEDIA_CONVERTERS = [
  {
    id: 'image',
    title: 'Image',
    tagline: 'Convert or compress images.',
    icon: 'solar:gallery-bold-duotone',
    badgeIcon: 'heroicons:photo-solid',
    badgeColor: 'text-gray-700 bg-gray-100 border-gray-200',
    formats: ['WEBP', 'PNG', 'JPG'],
    accept: 'image/png,image/jpeg,image/webp',
    gradient: 'from-gray-700/10 via-gray-500/5 to-transparent',
    accentColor: '#1e232d',
    accentBg: 'bg-[#1e232d]',
    accentHover: 'hover:bg-[#ea543a]',
    defaultOutput: 'WEBP',
    compressionLevels: ['Original Quality (Format Only)', 'High Quality (85%)', 'Balanced (70%)', 'Maximum Compression (50%)'],
    maxSize: MAX_FILE_SIZES.image
  },
  {
    id: 'video',
    title: 'Video',
    tagline: 'Convert or compress videos.',
    icon: 'solar:videocamera-record-bold-duotone',
    badgeIcon: 'heroicons:video-camera-solid',
    badgeColor: 'text-gray-700 bg-gray-100 border-gray-200',
    formats: ['MP4', 'WEBM'],
    accept: 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska',
    gradient: 'from-gray-700/10 via-gray-500/5 to-transparent',
    accentColor: '#1e232d',
    accentBg: 'bg-[#1e232d]',
    accentHover: 'hover:bg-[#ea543a]',
    defaultOutput: 'MP4',
    compressionLevels: ['Original Resolution & Quality (Format Only)', '1080p Web-Optimized', '720p HD Compact', '480p Mobile Saver'],
    maxSize: MAX_FILE_SIZES.video
  },
  {
    id: 'threed',
    title: '3D Model',
    tagline: 'Convert or compress 3D models.',
    icon: 'solar:box-bold-duotone',
    badgeIcon: 'heroicons:cube-solid',
    badgeColor: 'text-gray-700 bg-gray-100 border-gray-200',
    formats: ['GLB', 'OBJ', 'FBX', 'USDZ'],
    accept: '.glb,.obj,.fbx,.usdz',
    gradient: 'from-gray-700/10 via-gray-500/5 to-transparent',
    accentColor: '#1e232d',
    accentBg: 'bg-[#1e232d]',
    accentHover: 'hover:bg-[#ea543a]',
    defaultOutput: 'GLB',
    compressionLevels: ['Original Quality (Lossless)', 'Draco + Meshopt (High)', 'Texture Only (70%)', 'Lossless Optimization'],
    maxSize: MAX_FILE_SIZES.threed
  }
];

export default function Converter() {
  const [activeWorkspaceMediaId, setActiveWorkspaceMediaId] = useState(null);
  const [fileByMedia, setFileByMedia] = useState({});
  const [dragOverMediaId, setDragOverMediaId] = useState(null);
  const [sizeWarning, setSizeWarning] = useState(null);

  // Preload background-removal AI model silently in background once on /converter page
  useEffect(() => {
    preloadBackgroundRemovalModel();
  }, []);

  const fileInputRefs = {
    image: useRef(null),
    video: useRef(null),
    threed: useRef(null)
  };

  const formatBytes = (bytes = 0) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Called when user selects or drops a single file
  const handleSelectFile = (mediaId, fileList) => {
    const rawFiles = Array.from(fileList || []);
    if (!rawFiles.length) return;

    // Pick strictly the first file (Single file only)
    const file = rawFiles[0];
    const limit = MAX_FILE_SIZES[mediaId];

    if (limit && file.size > limit.bytes) {
      setSizeWarning(
        `"${file.name}" exceeds the maximum size limit of ${limit.label}. Please select a smaller file.`
      );
      setTimeout(() => setSizeWarning(null), 5000);
      return;
    }

    const formatted = {
      file,
      name: file.name,
      size: file.size,
      formattedSize: formatBytes(file.size),
      ext: file.name.split('.').pop()?.toUpperCase() || '',
      previewUrl: URL.createObjectURL(file)
    };

    setFileByMedia((prev) => ({
      ...prev,
      [mediaId]: formatted
    }));

    // Transition to workspace studio page
    setActiveWorkspaceMediaId(mediaId);
  };

  // If a workspace is active and has a file, show the dedicated workspace studio
  const activeMediaConfig = MEDIA_CONVERTERS.find((m) => m.id === activeWorkspaceMediaId);
  const activeFileItem = activeWorkspaceMediaId ? fileByMedia[activeWorkspaceMediaId] : null;

  if (activeMediaConfig && activeFileItem) {
    return (
      <ConverterWorkspace
        mediaConfig={activeMediaConfig}
        fileItem={activeFileItem}
        onBack={() => setActiveWorkspaceMediaId(null)}
        onFileSelect={(files) => handleSelectFile(activeWorkspaceMediaId, files)}
      />
    );
  }

  // Converter Home Page
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-poppins select-none text-[#1e232d]">
      
      {/* Hidden File Inputs (Strictly single file: multiple=false) */}
      {MEDIA_CONVERTERS.map((media) => (
        <input
          key={media.id}
          ref={fileInputRefs[media.id]}
          type="file"
          accept={media.accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleSelectFile(media.id, e.target.files);
            e.target.value = '';
          }}
        />
      ))}

      {/* Main Header / Title Section */}
      <section className="w-full pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-semibold text-[#35363A] tracking-tight leading-tight mb-3">
            Convert &amp; Compress <span className="text-[#EC5137]">Your Media</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed">
            Convert or compress your 3D models, videos, and images with live interactive previews.
          </p>

          {sizeWarning && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2 max-w-lg text-left shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{sizeWarning}</span>
            </div>
          )}
        </div>
      </section>

      {/* 3 Main Converter Cards Section */}
      <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {MEDIA_CONVERTERS.map((media) => {
            const isDragging = dragOverMediaId === media.id;

            return (
              <div
                key={media.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 shadow-xs hover:shadow-md relative overflow-hidden group"
              >
                {/* Top Subtle Gradient Light */}
                <div
                  className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-b ${media.gradient} pointer-events-none transition-opacity`}
                />

                {/* Card Top Area */}
                <div>
                  
                  {/* Drop / Select Canvas Box */}
                  <div
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragOverMediaId(media.id);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragOverMediaId(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverMediaId(media.id);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverMediaId(null);
                      if (e.dataTransfer?.files?.length) {
                        handleSelectFile(media.id, e.dataTransfer.files);
                      }
                    }}
                    onClick={() => {
                      fileInputRefs[media.id]?.current?.click();
                    }}
                    className={`w-full h-48 sm:h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                      isDragging
                        ? 'border-gray-900 bg-gray-100 scale-[1.02]'
                        : 'border-gray-200 bg-gray-50/70 hover:bg-white hover:border-[#ea543a]'
                    }`}
                  >
                    {/* Badge Icon */}
                    <div className={`absolute top-3 left-3 p-1.5 rounded-lg border shadow-2xs ${media.badgeColor}`}>
                      <Icon icon={media.badgeIcon} className="w-4 h-4" />
                    </div>

                    {/* Max Size Indicator */}
                    <div className="absolute top-3 right-3 text-[10px] font-medium text-gray-500 bg-white/90 px-2 py-0.5 rounded-md border border-gray-200">
                      Max {media.maxSize.label}
                    </div>

                    {/* Empty State Prompt */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center mb-3 text-gray-800 group-hover:scale-110 group-hover:text-[#ea543a] group-hover:border-[#ea543a]/40 transition-all duration-300">
                        <Icon icon={media.icon} className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-0.5">
                        {isDragging ? 'Drop file to upload' : `Drop ${media.title} here`}
                      </p>
                      <p className="text-xs text-gray-400 font-normal">or click to browse</p>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="text-center mt-6 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
                      {media.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed px-1 font-normal whitespace-nowrap">
                      {media.tagline}
                    </p>
                  </div>

                  {/* Format Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                    {media.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-medium text-gray-600 border border-gray-200/60"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Bottom Trigger Action Button */}
                <div className="mt-6 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRefs[media.id]?.current?.click();
                    }}
                    className="w-full py-3.5 px-4 rounded-xl text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer bg-[#1e232d] hover:bg-[#ea543a]"
                  >
                    <span>Choose {media.title} File</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Section (Minimal without cards) */}
      <section className="w-full pb-14 pt-4 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
          
          <div className="flex flex-col items-center group cursor-default">
            <div className="mb-2.5 text-[#ea543a] transition-transform duration-200 group-hover:scale-110">
              <Zap className="w-5 h-5 stroke-[2]" />
            </div>
            <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-0.5 tracking-tight">Instant Processing</h4>
            <p className="text-xs text-gray-500 font-normal leading-relaxed">
              Fast, high-fidelity in-browser conversion
            </p>
          </div>

          <div className="flex flex-col items-center group cursor-default">
            <div className="mb-2.5 text-[#ea543a] transition-transform duration-200 group-hover:scale-110">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-0.5 tracking-tight">Lossless Quality</h4>
            <p className="text-xs text-gray-500 font-normal leading-relaxed">
              Crisp texture resolution & mesh fidelity
            </p>
          </div>

          <div className="flex flex-col items-center group cursor-default">
            <div className="mb-2.5 text-[#ea543a] transition-transform duration-200 group-hover:scale-110">
              <Layers className="w-5 h-5 stroke-[2]" />
            </div>
            <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-0.5 tracking-tight">Web Optimized</h4>
            <p className="text-xs text-gray-500 font-normal leading-relaxed">
              Ultra-compact assets ready for web & mobile
            </p>
          </div>

        </div>
      </section>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}
