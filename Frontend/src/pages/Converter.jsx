import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import {
  CheckCircle2,
  Layers,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Zap,
  Download
} from 'lucide-react';
import Footer from './Footer';

// The 3 Media Types to Convert & Compress
const MEDIA_CONVERTERS = [
  {
    id: 'image',
    title: 'Image',
    tagline: 'Convert or compress images to different formats with crystal-clear quality.',
    icon: 'solar:gallery-bold-duotone',
    badgeIcon: 'heroicons:photo-solid',
    badgeColor: 'text-[#ea543a] bg-orange-50 border-orange-200',
    formats: ['PNG', 'JPG', 'WEBP', 'SVG', 'AVIF', 'GIF'],
    accept: 'image/png,image/jpeg,image/webp,image/svg+xml,image/avif,image/gif',
    gradient: 'from-orange-500/15 via-rose-500/5 to-transparent',
    accentColor: '#ea543a',
    accentBg: 'bg-[#ea543a]',
    accentHover: 'hover:bg-[#d4452e]',
    defaultOutput: 'WEBP',
    compressionLevels: ['High Quality (85%)', 'Balanced (70%)', 'Maximum Compression (50%)']
  },
  {
    id: 'video',
    title: 'Video',
    tagline: 'Convert or compress videos to different formats with optimized smooth playback.',
    icon: 'solar:videocamera-record-bold-duotone',
    badgeIcon: 'heroicons:video-camera-solid',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    formats: ['MP4', 'WEBM', 'MOV', 'AVI', 'MKV', 'GIF'],
    accept: 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska',
    gradient: 'from-indigo-500/15 via-blue-500/5 to-transparent',
    accentColor: '#4f46e5',
    accentBg: 'bg-indigo-600',
    accentHover: 'hover:bg-indigo-700',
    defaultOutput: 'MP4',
    compressionLevels: ['1080p Web-Optimized', '720p HD Compact', '480p Mobile Saver']
  },
  {
    id: 'threed',
    title: '3D Model',
    tagline: 'Convert or compress 3D models to web-ready formats with high fidelity.',
    icon: 'solar:box-bold-duotone',
    badgeIcon: 'heroicons:cube-solid',
    badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    formats: ['GLB', 'GLTF', 'OBJ', 'FBX', 'STL', 'STEP'],
    accept: '.glb,.gltf,.obj,.fbx,.stl,.step,.iges',
    gradient: 'from-emerald-500/15 via-teal-500/5 to-transparent',
    accentColor: '#059669',
    accentBg: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    defaultOutput: 'GLB',
    compressionLevels: ['Draco + Meshopt (High)', 'Texture Only (70%)', 'Lossless Optimization']
  }
];

export default function Converter() {
  const [activeMedia, setActiveMedia] = useState('image');
  const [selectedFiles, setSelectedFiles] = useState({});
  const [outputFormats, setOutputFormats] = useState({
    image: 'WEBP',
    video: 'MP4',
    threed: 'GLB'
  });
  const [compressionSettings, setCompressionSettings] = useState({
    image: 'Balanced (70%)',
    video: '1080p Web-Optimized',
    threed: 'Draco + Meshopt (High)'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processStatus, setProcessStatus] = useState('');
  const [completedResults, setCompletedResults] = useState(null);
  const [dragOverMediaId, setDragOverMediaId] = useState(null);

  const fileInputRefs = {
    image: useRef(null),
    video: useRef(null),
    threed: useRef(null)
  };

  const handleSelectFiles = (mediaId, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setSelectedFiles((prev) => ({
      ...prev,
      [mediaId]: files.map((file) => ({
        file,
        name: file.name,
        size: file.size,
        formattedSize: formatBytes(file.size),
        ext: file.name.split('.').pop()?.toUpperCase() || ''
      }))
    }));
    setCompletedResults(null);
  };

  const removeFile = (mediaId, index) => {
    setSelectedFiles((prev) => {
      const current = prev[mediaId] || [];
      const updated = current.filter((_, i) => i !== index);
      return { ...prev, [mediaId]: updated };
    });
  };

  const formatBytes = (bytes = 0) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Convert & Compress Handler (Frontend Simulation with realistic step progression)
  const handleExecuteConvertAndCompress = (mediaId) => {
    const files = selectedFiles[mediaId] || [];
    if (files.length === 0) {
      fileInputRefs[mediaId]?.current?.click();
      return;
    }

    setIsProcessing(true);
    setProcessProgress(10);
    setProcessStatus(`Analyzing and parsing ${files.length} ${MEDIA_CONVERTERS.find(m => m.id === mediaId)?.title} file(s)...`);

    const targetFormat = outputFormats[mediaId];
    const targetCompression = compressionSettings[mediaId];

    setTimeout(() => {
      setProcessProgress(40);
      setProcessStatus(`Applying ${targetCompression} compression...`);
    }, 700);

    setTimeout(() => {
      setProcessProgress(75);
      setProcessStatus(`Encoding to ${targetFormat} format...`);
    }, 1400);

    setTimeout(() => {
      setProcessProgress(100);
      setProcessStatus('Completed successfully!');

      const results = files.map((f) => {
        const reducedRatio = mediaId === 'image' ? 0.45 : mediaId === 'video' ? 0.6 : 0.55;
        const newSize = Math.max(1024, Math.round(f.size * reducedRatio));
        const savedPercent = Math.round((1 - newSize / f.size) * 100);
        const newName = `${f.name.replace(/\.[^/.]+$/, '')}_converted.${targetFormat.toLowerCase()}`;

        return {
          originalName: f.name,
          newName,
          originalSize: f.formattedSize,
          newSize: formatBytes(newSize),
          savedPercent,
          targetFormat
        };
      });

      setCompletedResults({
        mediaId,
        results
      });
      setIsProcessing(false);
    }, 2100);
  };

  const handleDownloadSimulation = (filename) => {
    // Generate dummy blob download
    const blob = new Blob(['Simulated converted & compressed media content'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none text-[#1e232d]">
      
      {/* Hidden File Inputs */}
      {MEDIA_CONVERTERS.map((media) => (
        <input
          key={media.id}
          ref={fileInputRefs[media.id]}
          type="file"
          multiple
          accept={media.accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleSelectFiles(media.id, e.target.files);
            e.target.value = '';
          }}
        />
      ))}

      {/* Main Header / Title Section */}
      <section className="w-full pt-10 sm:pt-14 pb-8 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-[#1e232d] tracking-tight leading-tight mb-2.5">
            Convert & Compress Your Media
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed">
            Convert or compress your 3D models, Videos and images in a few clicks.
          </p>
        </div>
      </section>

      {/* 3 Main Converter Cards Section */}
      <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {MEDIA_CONVERTERS.map((media) => {
            const files = selectedFiles[media.id] || [];
            const isCardActive = activeMedia === media.id;
            const isDragging = dragOverMediaId === media.id;
            const currentOutput = outputFormats[media.id];
            const currentCompression = compressionSettings[media.id];

            return (
              <div
                key={media.id}
                onClick={() => setActiveMedia(media.id)}
                className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 shadow-sm hover:shadow-lg relative overflow-hidden group ${
                  isCardActive
                    ? 'border-[#ea543a] ring-2 ring-[#ea543a]/15 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Top Subtle Gradient Light */}
                <div
                  className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-b ${media.gradient} pointer-events-none transition-opacity`}
                />

                {/* Card Top Area: Visual Drop Box without external photos */}
                <div>
                  
                  {/* Drop / Preview Canvas Box */}
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
                        handleSelectFiles(media.id, e.dataTransfer.files);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRefs[media.id]?.current?.click();
                    }}
                    className={`w-full h-44 sm:h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/70 scale-[1.02]'
                        : files.length > 0
                        ? 'border-[#ea543a] bg-orange-50/20'
                        : 'border-gray-200 bg-gray-50/70 hover:bg-white hover:border-[#ea543a]/60'
                    }`}
                  >
                    {/* Badge Icon (Top Left inside Box) */}
                    <div className={`absolute top-3 left-3 p-1.5 rounded-lg border shadow-2xs ${media.badgeColor}`}>
                      <Icon icon={media.badgeIcon} className="w-4 h-4" />
                    </div>

                    {files.length > 0 ? (
                      /* Display Selected File Info */
                      <div className="flex flex-col items-center text-center px-2">
                        <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center mb-2 text-[#ea543a]">
                          <Icon icon={media.icon} className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                          {files[0].name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {files[0].formattedSize} {files.length > 1 && `+ ${files.length - 1} more`}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-semibold text-[#ea543a] hover:underline">
                            Replace file
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(media.id, 0);
                            }}
                            className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Empty State: Big Clean Icon & Drag Prompt (No external photos) */
                      <div className="flex flex-col items-center text-center">
                        <div className="w-13 h-13 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center mb-3 text-gray-700 group-hover:scale-110 group-hover:text-[#ea543a] group-hover:border-[#ea543a]/40 transition-all duration-300">
                          <Icon icon={media.icon} className="w-7 h-7" />
                        </div>
                        <p className="text-xs font-bold text-gray-800 mb-0.5">
                          {isDragging ? 'Drop here to upload' : `Drop ${media.title}s here`}
                        </p>
                        <p className="text-[11px] text-gray-400">or click to browse files</p>
                      </div>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <div className="text-center mt-5 mb-4">
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                      {media.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed px-1">
                      {media.tagline}
                    </p>
                  </div>

                  {/* Format & Compression Quick Selectors */}
                  <div className="space-y-2.5 pt-2 border-t border-gray-100">
                    
                    {/* Target Format Selector */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-gray-400" />
                        Convert to:
                      </span>
                      <div className="flex items-center gap-1">
                        {media.formats.slice(0, 4).map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOutputFormats((prev) => ({ ...prev, [media.id]: fmt }));
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              currentOutput === fmt
                                ? 'bg-[#1e232d] text-white shadow-2xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Compression Preset Selector */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium flex items-center gap-1">
                        <SlidersHorizontal className="w-3 h-3 text-gray-400" />
                        Compress:
                      </span>
                      <select
                        value={currentCompression}
                        onChange={(e) => {
                          e.stopPropagation();
                          setCompressionSettings((prev) => ({ ...prev, [media.id]: e.target.value }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none cursor-pointer hover:border-gray-300"
                      >
                        {media.compressionLevels.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>

                </div>

                {/* Bottom Single Unified Action Button */}
                <div className="mt-5 pt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecuteConvertAndCompress(media.id);
                    }}
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                      media.accentBg
                    } ${media.accentHover}`}
                  >
                    <Icon icon="solar:round-transfer-horizontal-bold" className="w-4 h-4 text-white" />
                    <span>Convert & Compress {media.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Processing Loader Modal / Banner */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ea543a] mb-4">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Optimizing Your Media
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                {processStatus}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-3">
                <motion.div
                  className="bg-[#ea543a] h-full rounded-full transition-all duration-300"
                  style={{ width: `${processProgress}%` }}
                />
              </div>

              <div className="flex justify-between w-full text-[11px] font-semibold text-gray-400">
                <span>Processing</span>
                <span className="text-[#ea543a]">{processProgress}%</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed Results Modal */}
      <AnimatePresence>
        {completedResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 relative text-left"
            >
              <button
                onClick={() => setCompletedResults(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Conversion & Compression Ready</h3>
                  <p className="text-xs text-gray-500">Your files have been transformed and optimized.</p>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 my-4">
                {completedResults.results.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="text-xs font-bold text-gray-800 truncate">{res.newName}</p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        <span className="line-through">{res.originalSize}</span>
                        <span className="text-emerald-600 font-bold">{res.newSize}</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          -{res.savedPercent}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadSimulation(res.newName)}
                      className="px-3 py-1.5 rounded-lg bg-[#1e232d] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCompletedResults(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    completedResults.results.forEach((r) => handleDownloadSimulation(r.newName));
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#ea543a] hover:bg-[#d5452e] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download All</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Highlights Section */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          
          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ea543a] flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-gray-900 mb-1">High-Speed Processing</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Optimized algorithms compress models, videos, and images with near-zero latency in the browser.
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-gray-900 mb-1">Lossless Quality Retention</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Advanced texture optimization & Draco mesh compression maintain crisp visual fidelity.
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-gray-900 mb-1">Universal Web Formats</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Outputs web-ready WebP, MP4, and GLB formats compatible with all flipbooks and 3D viewers.
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
