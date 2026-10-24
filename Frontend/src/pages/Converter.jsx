import React, { useState, useRef } from 'react';
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

// Maximum recommended file sizes to ensure smooth browser performance
const MAX_FILE_SIZES = {
  image: { bytes: 40 * 1024 * 1024, label: '40 MB' },
  video: { bytes: 200 * 1024 * 1024, label: '200 MB' },
  threed: { bytes: 120 * 1024 * 1024, label: '120 MB' }
};

// The 3 Media Types to Convert & Compress
const MEDIA_CONVERTERS = [
  {
    id: 'image',
    title: 'Image',
    tagline: 'Convert or compress images with crisp resolution.',
    icon: 'solar:gallery-bold-duotone',
    badgeIcon: 'heroicons:photo-solid',
    badgeColor: 'text-[#ea543a] bg-orange-50 border-orange-200',
    formats: ['WEBP', 'PNG', 'JPG', 'AVIF'],
    accept: 'image/png,image/jpeg,image/webp,image/avif',
    gradient: 'from-orange-500/15 via-rose-500/5 to-transparent',
    accentColor: '#ea543a',
    accentBg: 'bg-[#ea543a]',
    accentHover: 'hover:bg-[#d4452e]',
    defaultOutput: 'WEBP',
    compressionLevels: ['Original Quality (Format Only)', 'High Quality (85%)', 'Balanced (70%)', 'Maximum Compression (50%)'],
    maxSize: MAX_FILE_SIZES.image
  },
  {
    id: 'video',
    title: 'Video',
    tagline: 'Convert or compress videos for fast and smooth playback.',
    icon: 'solar:videocamera-record-bold-duotone',
    badgeIcon: 'heroicons:video-camera-solid',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    formats: ['MP4', 'WEBM'],
    accept: 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska',
    gradient: 'from-indigo-500/15 via-blue-500/5 to-transparent',
    accentColor: '#4f46e5',
    accentBg: 'bg-indigo-600',
    accentHover: 'hover:bg-indigo-700',
    defaultOutput: 'MP4',
    compressionLevels: ['Original Resolution & Quality (Format Only)', '1080p Web-Optimized', '720p HD Compact', '480p Mobile Saver'],
    maxSize: MAX_FILE_SIZES.video
  },
  {
    id: 'threed',
    title: '3D Model',
    tagline: 'Convert or compress 3D models to web-ready formats.',
    icon: 'solar:box-bold-duotone',
    badgeIcon: 'heroicons:cube-solid',
    badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    formats: ['GLB', 'GLTF', 'OBJ', 'STL', 'FBX', 'STEP'],
    accept: '.glb,.gltf,.obj,.fbx,.stl,.step,.stp,.iges,.igs',
    gradient: 'from-emerald-500/15 via-teal-500/5 to-transparent',
    accentColor: '#059669',
    accentBg: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
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
        fileInputRef={fileInputRefs[activeWorkspaceMediaId]}
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
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1e232d] tracking-tight leading-tight mb-3">
            Convert & Compress Your Media
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
                        ? 'border-emerald-500 bg-emerald-50/70 scale-[1.02]'
                        : 'border-gray-200 bg-gray-50/70 hover:bg-white hover:border-[#ea543a]/60'
                    }`}
                  >
                    {/* Badge Icon */}
                    <div className={`absolute top-3 left-3 p-1.5 rounded-lg border shadow-2xs ${media.badgeColor}`}>
                      <Icon icon={media.badgeIcon} className="w-4 h-4" />
                    </div>

                    {/* Max Size Indicator */}
                    <div className="absolute top-3 right-3 text-[10px] font-semibold text-gray-400 bg-white/80 px-2 py-0.5 rounded-md border border-gray-100">
                      Max {media.maxSize.label}
                    </div>

                    {/* Empty State Prompt */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center mb-3 text-gray-700 group-hover:scale-110 group-hover:text-[#ea543a] group-hover:border-[#ea543a]/40 transition-all duration-300">
                        <Icon icon={media.icon} className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        {isDragging ? 'Drop file to upload' : `Drop ${media.title} here`}
                      </p>
                      <p className="text-xs text-gray-400">or click to browse</p>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="text-center mt-6 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      {media.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed px-1">
                      {media.tagline}
                    </p>
                  </div>

                  {/* Format Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                    {media.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-semibold text-gray-600"
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
                    className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                      media.accentBg
                    } ${media.accentHover}`}
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

      {/* Feature Highlights Section */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          
          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ea543a] flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-gray-900 mb-1">Fast Processing</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Instant conversions and compression with responsive real-time previews.
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-gray-900 mb-1">High Quality Retention</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Optimized textures and mesh geometry to keep your media sharp.
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-gray-900 mb-1">Standard Web Formats</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Outputs web-compatible WebP, MP4, and GLB formats ready for any viewer.
            </p>
          </div>

        </div>
      </section>

      {/* Global Footer */}
      <section className="w-full bg-[#1e232a] text-white">
        <Footer />
      </section>

    </div>
  );
}
