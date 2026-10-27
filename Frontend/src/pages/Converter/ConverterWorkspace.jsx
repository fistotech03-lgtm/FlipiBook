import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Download,
  Check,
  AlertCircle,
  Eye,
  Replace,
  Columns,
  Zap,
  RotateCw,
  Sparkles,
  ChevronDown,
  Layers,
  Sliders,
  Maximize2,
  X,
  UploadCloud,
  FileArchive,
  FolderUp,
  Box
} from 'lucide-react';
import ThreePreviewCanvas from './ThreePreviewCanvas';
import MediaPreviewModal from './MediaPreviewModal';
import { processMediaFile } from './index';

export default function ConverterWorkspace({
  mediaConfig,
  fileItem,
  onBack,
  onFileSelect,
  onDropMedia
}) {
  const localFileInputRef = useRef(null);
  const localFolderInputRef = useRef(null);
  const modalSingleInputRef = useRef(null);
  const modalFolderInputRef = useRef(null);
  const controlsPanelRef = useRef(null);
  const progressSectionRef = useRef(null);

  const [isChangeModelModalOpen, setIsChangeModelModalOpen] = useState(false);
  const [modalDragActive, setModalDragActive] = useState(false);

  const [targetFormat, setTargetFormat] = useState(mediaConfig.defaultOutput || mediaConfig.formats[0]);
  const [compressionSetting, setCompressionSetting] = useState(mediaConfig.compressionLevels[0]);

  // Dynamic file metadata (resolution, duration, vertex/polygon counts)
  const [fileDetails, setFileDetails] = useState(null);
  const [detectedAnimations, setDetectedAnimations] = useState([]);

  // 3D Auto Rotate toggle state
  const [autoRotate3D, setAutoRotate3D] = useState(true);

  // View mode: 'split' | 'original' | 'converted'
  const [viewMode, setViewMode] = useState('split');

  // Conversion process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processStatus, setProcessStatus] = useState('');
  const [convertedResult, setConvertedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fullscreen preview modal state
  const [previewModalItem, setPreviewModalItem] = useState(null);

  // Background removal option for Images
  const [removeBackground, setRemoveBackground] = useState(false);

  // Auto turn off removeBackground if JPG is selected (since JPG doesn't support alpha channel)
  useEffect(() => {
    if (targetFormat === 'JPG' || targetFormat === 'JPEG') {
      setRemoveBackground(false);
    }
  }, [targetFormat]);

  // Reset previous conversion result when fileItem changes (e.g. via Change File)
  useEffect(() => {
    setConvertedResult(null);
    setProcessProgress(0);
    setProcessStatus('');
    setErrorMessage(null);
    setViewMode('original');
    setDetectedAnimations([]);
  }, [fileItem]);

  // Extract detailed media metadata based on file type
  useEffect(() => {
    if (!fileItem?.file) return;

    let isSubscribed = true;

    // 1. Image: width, height, aspect ratio
    if (mediaConfig.id === 'image') {
      const img = new Image();
      const url = URL.createObjectURL(fileItem.file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (!isSubscribed) return;
        setFileDetails({
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
          aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2) + ':1',
          colorSpace: 'sRGB / 8-bit'
        });
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    }

    // 2. Video: resolution, duration, framerate estimate
    else if (mediaConfig.id === 'video') {
      const vid = document.createElement('video');
      const url = URL.createObjectURL(fileItem.file);
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        if (!isSubscribed) return;
        const dur = Math.round(vid.duration || 0);
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;
        setFileDetails({
          dimensions: `${vid.videoWidth} × ${vid.videoHeight} px`,
          duration: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
          aspectRatio: (vid.videoWidth / (vid.videoHeight || 1)).toFixed(2) + ':1'
        });
      };
      vid.onerror = () => URL.revokeObjectURL(url);
      vid.src = url;
    }

    // 3. 3D Model: inspection for polygons, vertices, and internal format
    else if (mediaConfig.id === 'threed') {
      (async () => {
        try {
          const ext = fileItem.ext.toLowerCase();
          if (ext === 'glb') {
            const buf = await fileItem.file.slice(0, 50000).arrayBuffer();
            const view = new DataView(buf);
            if (view.getUint32(0, true) === 0x46546c67) {
              const jsonLen = view.getUint32(12, true);
              const jsonBytes = new Uint8Array(await fileItem.file.slice(20, 20 + jsonLen).arrayBuffer());
              const jsonStr = new TextDecoder().decode(jsonBytes);
              const gltf = JSON.parse(jsonStr);

              let tris = 0;
              let verts = 0;
              if (gltf.meshes) {
                gltf.meshes.forEach((m) => {
                  m.primitives?.forEach((p) => {
                    if (p.indices !== undefined && gltf.accessors?.[p.indices]) {
                      tris += gltf.accessors[p.indices].count / 3;
                    }
                    if (p.attributes?.POSITION !== undefined && gltf.accessors?.[p.attributes.POSITION]) {
                      verts += gltf.accessors[p.attributes.POSITION].count;
                    }
                  });
                });
              }

              if (isSubscribed) {
                setFileDetails({
                  polygons: Math.round(tris).toLocaleString() + ' tris',
                  vertices: Math.round(verts).toLocaleString(),
                  meshes: (gltf.meshes?.length || 1).toString(),
                  materials: (gltf.materials?.length || 0).toString()
                });
              }
              return;
            }
          }

          if (isSubscribed) {
            setFileDetails({
              modelType: fileItem.ext + ' Asset',
              geometry: 'Mesh'
            });
          }
        } catch (_e) {
          if (isSubscribed) {
            setFileDetails({ modelType: fileItem.ext });
          }
        }
      })();
    }

    return () => {
      isSubscribed = false;
    };
  }, [fileItem, mediaConfig.id]);

  const formatBytes = (bytes = 0) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleStartConversion = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessProgress(5);
    setProcessStatus('Initializing...');

    // Smoothly scroll down the right panel so the user immediately sees the progress status bar
    setTimeout(() => {
      if (controlsPanelRef.current) {
        controlsPanelRef.current.scrollTo({
          top: controlsPanelRef.current.scrollHeight,
          behavior: 'smooth'
        });
      } else if (progressSectionRef.current) {
        progressSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);

    // Small timeout to allow browser UI thread to render progress state before heavy tasks
    await new Promise((r) => setTimeout(r, 60));

    try {
      const convertedBlob = await processMediaFile({
        file: fileItem.file,
        mediaType: mediaConfig.id,
        targetFormat,
        compressionPreset: compressionSetting,
        removeBg: mediaConfig.id === 'image' && removeBackground,
        onProgress: (percent, msg) => {
          setProcessProgress(percent);
          setProcessStatus(msg);
        }
      });

      const newSize = convertedBlob.size;
      const savedPercent = fileItem.size > 0 ? Math.round(((fileItem.size - newSize) / fileItem.size) * 100) : 0;
      const baseName = fileItem.name.replace(/\.[^/.]+$/, '');
      const newName = `${baseName}_converted.${targetFormat.toLowerCase()}`;
      const blobUrl = URL.createObjectURL(convertedBlob);

      let convertedDimensions = null;
      if (mediaConfig.id === 'image') {
        try {
          const img = new Image();
          const dUrl = URL.createObjectURL(convertedBlob);
          await new Promise((resolve) => {
            img.onload = () => {
              convertedDimensions = `${img.naturalWidth} × ${img.naturalHeight} px`;
              URL.revokeObjectURL(dUrl);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(dUrl);
              resolve();
            };
            img.src = dUrl;
          });
        } catch (_e) {}
      }

      const result = {
        originalName: fileItem.name,
        newName,
        originalSize: fileItem.formattedSize,
        newSize: formatBytes(newSize),
        savedPercent,
        targetFormat,
        blobUrl,
        blob: convertedBlob,
        dimensions: convertedDimensions
      };

      setConvertedResult(result);
      setViewMode('split');
      setProcessProgress(100);
      setProcessStatus('Completed');
    } catch (err) {
      console.error('Conversion failed:', err);
      setErrorMessage(err.message || 'An error occurred during conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadFile = () => {
    if (!convertedResult?.blobUrl) return;
    const a = document.createElement('a');
    a.href = convertedResult.blobUrl;
    a.download = convertedResult.newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isConvertedReady = Boolean(convertedResult);

  // Checkerboard pattern for transparency
  const checkerboardStyle = {
    backgroundImage: `
      linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
      linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)
    `,
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
  };

  return (
    <div className="w-full flex flex-col font-poppins text-slate-800 bg-[#F1F5F9] lg:h-full lg:min-h-0 lg:overflow-hidden">

      {/* 1. Header Toolbar */}
      <header className="shrink-0 min-h-12 sm:h-14 lg:h-[2.8vw] bg-white border-b border-slate-200/80 px-3 sm:px-6 lg:px-[1.5vw] relative flex items-center justify-between gap-2 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)] py-2 sm:py-0">
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-[0.6vw] min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-1.5 text-xs lg:text-[0.72vw] font-medium text-slate-600 hover:text-slate-900 px-1.5 sm:px-2.5 lg:px-[0.55vw] py-1 sm:py-1.5 lg:py-[0.3vw] rounded-lg lg:rounded-[0.4vw] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[0.85vw] lg:h-[0.85vw] text-slate-500" />
            <span className="hidden xs:inline">Back</span>
          </button>

          <div className="h-3.5 lg:h-[0.9vw] w-px bg-slate-200 shrink-0" />

          <div className="flex items-center gap-1 sm:gap-2 lg:gap-[0.4vw] min-w-0">
            <span className="text-xs sm:text-sm lg:text-[0.78vw] font-semibold text-slate-900 truncate">
              {mediaConfig.title} Converter
            </span>
            <span className="text-[9px] sm:text-[10px] lg:text-[0.58vw] text-slate-500 bg-slate-100/90 border border-slate-200/60 px-1.5 lg:px-[0.35vw] py-0.5 lg:py-[0.1vw] rounded-full font-medium leading-none shrink-0">
              Max {mediaConfig.maxSize?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-[0.5vw] shrink-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
          {mediaConfig.id === 'threed' ? (
            /* For 3D Converter: Change Model button that opens a comprehensive upload popup modal */
            <button
              type="button"
              onClick={() => setIsChangeModelModalOpen(true)}
              className="px-2 sm:px-3.5 lg:px-[0.8vw] py-1 sm:py-1.5 lg:py-[0.35vw] rounded-xl lg:rounded-[0.5vw] border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs lg:text-[0.72vw] font-medium flex items-center gap-1 sm:gap-1.5 lg:gap-[0.4vw] cursor-pointer transition-all shadow-xs hover:border-slate-300"
            >
              <Replace className="w-3.5 h-3.5 lg:w-[0.8vw] lg:h-[0.8vw] text-slate-500" />
              <span>Change<span className="hidden sm:inline"> Model</span></span>
            </button>
          ) : (
            /* For image & video converters: keep existing Change File input and button untouched */
            <>
              <input
                ref={localFileInputRef}
                type="file"
                accept={mediaConfig.accept}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0 && onFileSelect) {
                    onFileSelect(e.target.files);
                  }
                  e.target.value = '';
                }}
              />

              <button
                type="button"
                onClick={() => localFileInputRef.current?.click()}
                className="px-2 sm:px-3.5 lg:px-[0.8vw] py-1 sm:py-1.5 lg:py-[0.35vw] rounded-xl lg:rounded-[0.5vw] border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs lg:text-[0.72vw] font-medium flex items-center gap-1 sm:gap-1.5 lg:gap-[0.4vw] cursor-pointer transition-all shadow-xs hover:border-slate-300"
              >
                <Replace className="w-3.5 h-3.5 lg:w-[0.8vw] lg:h-[0.8vw] text-slate-500" />
                <span>Change<span className="hidden sm:inline"> File</span></span>
              </button>
            </>
          )}

          {convertedResult && (
            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-2.5 sm:px-4 lg:px-[0.9vw] py-1 sm:py-1.5 lg:py-[0.35vw] rounded-xl lg:rounded-[0.5vw] bg-[#ea543a] hover:bg-[#d8482f] text-white text-xs lg:text-[0.72vw] font-medium flex items-center gap-1 sm:gap-1.5 lg:gap-[0.4vw] transition-all cursor-pointer shadow-sm hover:shadow active:scale-98"
            >
              <Download className="w-3.5 h-3.5 lg:w-[0.8vw] lg:h-[0.8vw]" />
              <span>Download</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Studio Grid */}
      <div className="flex-1 w-full max-w-[1580px] lg:max-w-[85vw] mx-auto p-3 sm:p-5 lg:p-[1vw] flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-[1.2vw] lg:min-h-0 lg:overflow-hidden items-stretch">

        {/* Left: Viewport / Canvas Showcase (8 Columns on desktop, top on mobile/tablet) */}
        <div className="w-full lg:col-span-8 flex flex-col bg-white rounded-2xl lg:rounded-[1.2vw] border border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden h-[420px] sm:h-[500px] lg:h-auto min-h-[350px] lg:min-h-0">

          {/* Canvas Sub-Header */}
          <div className="shrink-0 px-4 sm:px-5 lg:px-[1.2vw] py-2.5 sm:py-3 lg:py-[0.7vw] border-b border-slate-100 flex items-center justify-between bg-white text-xs lg:text-[0.75vw]">
            <div className="flex items-center gap-2 lg:gap-[0.5vw] truncate pr-2">
              <span className="text-slate-800 text-xs sm:text-xs lg:text-[0.8vw] font-semibold truncate max-w-[150px] sm:max-w-xs lg:max-w-[18vw]">
                {fileItem.name}
              </span>
              <span className="text-2xs lg:text-[0.65vw] text-slate-400 font-mono bg-slate-50 px-1.5 lg:px-[0.4vw] py-0.5 lg:py-[0.15vw] rounded border border-slate-100">
                {fileItem.formattedSize}
              </span>
            </div>

            {/* Controls right */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-[0.5vw] shrink-0">
              {/* 3D Auto Rotate */}
              {mediaConfig.id === 'threed' && (
                <button
                  type="button"
                  onClick={() => setAutoRotate3D((prev) => !prev)}
                  className={`px-2 sm:px-2.5 lg:px-[0.6vw] py-1 lg:py-[0.3vw] rounded-md lg:rounded-[0.4vw] text-xs lg:text-[0.75vw] font-medium flex items-center gap-1 sm:gap-1.5 lg:gap-[0.3vw] transition-colors cursor-pointer border ${autoRotate3D
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <RotateCw className={`w-3 h-3 lg:w-[0.8vw] lg:h-[0.8vw] ${autoRotate3D ? 'text-emerald-600 animate-spin-slow' : 'text-slate-400'}`} />
                  <span>Rotation</span>
                </button>
              )}

              {/* View Selector Tabs */}
              {isConvertedReady && (
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg lg:rounded-[0.5vw] text-xs lg:text-[0.75vw] border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-2 sm:px-3 lg:px-[0.7vw] py-1 lg:py-[0.25vw] rounded-md lg:rounded-[0.4vw] text-xs lg:text-[0.75vw] transition-all cursor-pointer ${viewMode === 'split'
                      ? 'bg-white text-slate-900 shadow-xs font-medium'
                      : 'text-slate-600 hover:text-slate-900 font-normal'
                      }`}
                  >
                    Compare
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('original')}
                    className={`px-2 sm:px-3 lg:px-[0.7vw] py-1 lg:py-[0.25vw] rounded-md lg:rounded-[0.4vw] text-xs lg:text-[0.75vw] transition-all cursor-pointer ${viewMode === 'original'
                      ? 'bg-white text-slate-900 shadow-xs font-medium'
                      : 'text-slate-600 hover:text-slate-900 font-normal'
                      }`}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('converted')}
                    className={`px-2 sm:px-3 lg:px-[0.7vw] py-1 lg:py-[0.25vw] rounded-md lg:rounded-[0.4vw] text-xs lg:text-[0.75vw] transition-all cursor-pointer ${viewMode === 'converted'
                      ? 'bg-white text-slate-900 shadow-xs font-medium'
                      : 'text-slate-600 hover:text-slate-900 font-normal'
                      }`}
                  >
                    Output
                  </button>
                </div>
              )}

              {(!isConvertedReady || viewMode !== 'split') && (
                <button
                  type="button"
                  onClick={() => {
                    const display = isConvertedReady && viewMode !== 'original' ? convertedResult : fileItem;
                    setPreviewModalItem(display);
                  }}
                  className="p-1 sm:p-1.5 lg:p-[0.4vw] rounded-lg lg:rounded-[0.5vw] text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5 lg:w-[1vw] lg:h-[1vw]" />
                </button>
              )}
            </div>
          </div>

          {/* Canvas Viewing Stage */}
          <div className="flex-1 w-full p-2.5 sm:p-4 lg:p-[1vw] bg-[#E2E8F0]/40 min-h-0 flex items-center justify-center overflow-hidden">

            {/* Split Comparison View */}
            {isConvertedReady && (
              <div className={`w-full h-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-[1vw] min-h-0 ${viewMode === 'split' ? '' : 'hidden'}`}>

                {/* Left Card: Original */}
                <div className="flex flex-col rounded-xl lg:rounded-[0.9vw] border border-slate-200 bg-white overflow-hidden min-h-0 h-full shadow-2xs">
                  <div className="shrink-0 px-3 sm:px-3.5 lg:px-[0.9vw] py-1.5 sm:py-2 lg:py-[0.5vw] border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-2xs lg:text-[0.65vw]">
                    <span className="font-semibold text-slate-700">Original</span>
                    <span className="font-mono text-slate-500">{fileItem.formattedSize} • {fileItem.ext}</span>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 lg:p-[1vw] overflow-hidden bg-slate-50/30">
                    {mediaConfig.id === 'image' && (
                      <img src={fileItem.previewUrl} alt="Original" className="max-h-full max-w-full object-contain" />
                    )}
                    {mediaConfig.id === 'video' && (
                      <video src={fileItem.previewUrl} controls className="max-h-full max-w-full bg-black rounded" />
                    )}
                    {mediaConfig.id === 'threed' && (
                      <ThreePreviewCanvas
                        blobUrl={fileItem.previewUrl}
                        format={fileItem.ext}
                        autoRotate={autoRotate3D}
                        className="w-full h-full"
                        onAnimationsDetected={(anims) => {
                          if (anims && anims.length > 0) setDetectedAnimations(anims);
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Right Card: Output */}
                <div className="flex flex-col rounded-xl lg:rounded-[0.9vw] border border-emerald-200 bg-white overflow-hidden min-h-0 h-full shadow-2xs">
                  <div className="shrink-0 px-3 sm:px-3.5 lg:px-[0.9vw] py-1.5 sm:py-2 lg:py-[0.5vw] bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between text-2xs lg:text-[0.65vw]">
                    <span className="font-semibold flex items-center gap-1.5 lg:gap-[0.4vw] text-emerald-800">
                      <Check className="w-3.5 h-3.5 lg:w-[0.9vw] lg:h-[0.9vw] text-emerald-600" />
                      Converted Output
                    </span>
                    <span className="font-mono text-emerald-700 font-medium">
                      {convertedResult.newSize} • {convertedResult.targetFormat}
                      {convertedResult.savedPercent > 0 && ` (-${convertedResult.savedPercent}%)`}
                    </span>
                  </div>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 lg:p-[1vw] overflow-hidden relative"
                    style={mediaConfig.id === 'image' ? checkerboardStyle : undefined}
                  >
                    {mediaConfig.id === 'image' && (
                      <img src={convertedResult.blobUrl} alt="Converted" className="max-h-full max-w-full object-contain relative z-10" />
                    )}
                    {mediaConfig.id === 'video' && (
                      <video src={convertedResult.blobUrl} controls className="max-h-full max-w-full bg-black rounded" />
                    )}
                    {mediaConfig.id === 'threed' && (
                      <ThreePreviewCanvas
                        blobUrl={convertedResult.blobUrl}
                        format={convertedResult.targetFormat}
                        autoRotate={autoRotate3D}
                        className="w-full h-full"
                      />
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Single View: Original */}
            <div className={`w-full h-full flex flex-col items-center justify-center relative min-h-0 overflow-hidden ${(!isConvertedReady || viewMode === 'original') ? '' : 'hidden'
              }`}>
              {mediaConfig.id === 'image' && (
                <img
                  src={fileItem.previewUrl}
                  alt="Original Preview"
                  className="max-h-full max-w-full object-contain drop-shadow-sm"
                />
              )}
              {mediaConfig.id === 'video' && (
                <video
                  src={fileItem.previewUrl}
                  controls
                  className="max-h-full max-w-full bg-black rounded shadow-md"
                />
              )}
              {mediaConfig.id === 'threed' && (
                <ThreePreviewCanvas
                  blobUrl={fileItem.previewUrl}
                  format={fileItem.ext}
                  autoRotate={autoRotate3D}
                  className="w-full h-full"
                  onAnimationsDetected={(anims) => {
                    if (anims && anims.length > 0) setDetectedAnimations(anims);
                  }}
                />
              )}
            </div>

            {/* Single View: Converted */}
            {isConvertedReady && (
              <div className={`w-full h-full flex flex-col items-center justify-center relative min-h-0 overflow-hidden ${viewMode === 'converted' ? '' : 'hidden'
                }`}>
                {mediaConfig.id === 'image' && (
                  <div
                    className="w-full h-full flex items-center justify-center p-2 sm:p-4 lg:p-[1vw] overflow-hidden"
                    style={checkerboardStyle}
                  >
                    <img
                      src={convertedResult.blobUrl}
                      alt="Converted Preview"
                      className="max-h-full max-w-full object-contain relative z-10 drop-shadow-sm"
                    />
                  </div>
                )}
                {mediaConfig.id === 'video' && (
                  <video
                    src={convertedResult.blobUrl}
                    controls
                    className="max-h-full max-w-full bg-black rounded shadow-md"
                  />
                )}
                {mediaConfig.id === 'threed' && (
                  <ThreePreviewCanvas
                    blobUrl={convertedResult.blobUrl}
                    format={convertedResult.targetFormat}
                    autoRotate={autoRotate3D}
                    className="w-full h-full"
                  />
                )}
              </div>
            )}

          </div>

          {/* Minimalist Footer Status Bar */}
          <div className="shrink-0 px-4 sm:px-5 lg:px-[1.2vw] py-2 sm:py-2.5 lg:py-[0.6vw] bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs lg:text-[0.75vw] text-slate-500">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:gap-[0.6vw]">
              <span className="font-mono text-slate-600 font-medium">{fileItem.formattedSize}</span>
              {fileDetails?.dimensions && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">{fileDetails.dimensions}</span>
                </>
              )}
              {fileDetails?.duration && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">{fileDetails.duration}</span>
                </>
              )}
              {fileDetails?.polygons && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">{fileDetails.polygons}</span>
                </>
              )}
              {isConvertedReady && (
                <>
                  <span className="text-slate-300">→</span>
                  <span className="text-emerald-700 font-semibold font-mono">{convertedResult.newSize}</span>
                  {convertedResult.dimensions && convertedResult.dimensions !== fileDetails?.dimensions && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700 font-medium">{convertedResult.dimensions}</span>
                    </>
                  )}
                  {convertedResult.savedPercent > 0 && (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 lg:px-[0.4vw] py-0.5 lg:py-[0.15vw] rounded text-2xs lg:text-[0.65vw] font-medium">
                      -{convertedResult.savedPercent}%
                    </span>
                  )}
                </>
              )}
            </div>

            {isConvertedReady && (
              <button
                type="button"
                onClick={handleDownloadFile}
                className="text-slate-700 hover:text-[#ea543a] font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs lg:text-[0.75vw]"
              >
                <Download className="w-3.5 h-3.5 lg:w-[0.9vw] lg:h-[0.9vw]" />
                <span>Save Result</span>
              </button>
            )}
          </div>

        </div>

        {/* Right: Studio Controls Panel (4 Columns on desktop, stacked below on mobile/tablet) */}
        <div
          ref={controlsPanelRef}
          className="w-full lg:col-span-4 flex flex-col gap-4 sm:gap-4 lg:gap-[1vw] min-h-0 lg:h-full lg:overflow-y-auto lg:pr-1 scroll-smooth"
        >

          {/* Asset Info Card (Top) */}
          <div className="bg-white rounded-2xl lg:rounded-[1.2vw] border border-slate-200/90 p-4 sm:p-5 lg:p-[1.2vw] shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm sm:text-base lg:text-[1vw] font-semibold text-slate-900 tracking-tight mb-3 sm:mb-4 lg:mb-[0.9vw]">Asset Details</h2>
            <div className="space-y-3 sm:space-y-3.5 lg:space-y-[0.8vw] text-xs sm:text-sm lg:text-[0.8vw]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-normal">File Name</span>
                <span className="text-slate-800 font-medium truncate max-w-[170px] sm:max-w-[220px] lg:max-w-[14vw]" title={fileItem.name}>
                  {fileItem.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-normal">Source Size</span>
                <span className="text-slate-800 font-medium">{fileItem.formattedSize}</span>
              </div>
              {fileDetails?.dimensions && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-normal">Resolution</span>
                  <span className="text-slate-800 font-medium">{fileDetails.dimensions}</span>
                </div>
              )}
              {fileDetails?.duration && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-normal">Duration</span>
                  <span className="text-slate-800 font-medium">{fileDetails.duration}</span>
                </div>
              )}
              {fileDetails?.polygons && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-normal">Polygons</span>
                  <span className="text-slate-800 font-medium">{fileDetails.polygons}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 sm:pt-3.5 lg:pt-[0.8vw] border-t border-slate-100">
                <span className="text-slate-500 font-normal">Target Format</span>
                <span className="text-[#ea543a] font-semibold bg-orange-50 px-2.5 sm:px-3 lg:px-[0.8vw] py-0.5 sm:py-1 lg:py-[0.25vw] rounded-lg lg:rounded-[0.5vw] border border-orange-200/80 text-xs lg:text-[0.75vw] tracking-wide">
                  {targetFormat}
                </span>
              </div>
            </div>
          </div>

          {/* Main Controls Card (Format & Quality - Bottom) */}
          <div className="bg-white rounded-2xl lg:rounded-[1.2vw] border border-slate-200/90 p-4 sm:p-5 lg:p-[1.2vw] shadow-[0_2px_10px_rgba(15,23,42,0.04)] flex flex-col gap-4 sm:gap-5 lg:gap-[1.1vw]">

            {/* Header */}
            <div>
              <h2 className="text-sm sm:text-base lg:text-[1vw] font-semibold text-slate-900 tracking-tight">Format &amp; Quality</h2>
              <p className="text-xs lg:text-[0.75vw] text-slate-500 font-normal mt-0.5">Select your target format and compression balance</p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 lg:p-[0.7vw] rounded-xl lg:rounded-[0.7vw] bg-rose-50 border border-rose-200/80 text-rose-700 text-xs lg:text-[0.75vw] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 lg:w-[1vw] lg:h-[1vw] shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Target Format Selection (Clean segmented buttons with distinct separation) */}
            <div>
              <span className="text-xs lg:text-[0.78vw] font-semibold text-slate-800 block mb-2 lg:mb-[0.5vw]">
                Output Format
              </span>
              <div className="grid grid-flow-col auto-cols-fr bg-slate-100/90 p-1 lg:p-[0.25vw] rounded-xl lg:rounded-[0.7vw] border border-slate-200/80 gap-1 lg:gap-[0.25vw]">
                {mediaConfig.formats.map((fmt) => {
                  const isActive = targetFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-1.5 sm:py-2 lg:py-[0.5vw] text-xs lg:text-[0.75vw] rounded-lg lg:rounded-[0.5vw] transition-all cursor-pointer text-center font-medium ${isActive
                        ? 'bg-[#ea543a] text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>

              {/* Warning banner when source model contains animations but a format that only exports static meshes is chosen */}
              {mediaConfig.id === 'threed' && detectedAnimations.length > 0 && ['USDZ', 'OBJ', 'FBX'].includes(targetFormat) && (
                <div className="mt-2.5 lg:mt-[0.6vw]">
                  <div className="p-2.5 lg:p-[0.6vw] rounded-xl lg:rounded-[0.7vw] bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] lg:text-[0.7vw] leading-relaxed flex items-start gap-2 shadow-2xs">
                    <AlertCircle className="w-3.5 h-3.5 lg:w-[0.9vw] lg:h-[0.9vw] text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold text-amber-900">Static Export:</strong> This model has{' '}
                      <strong className="font-semibold">{detectedAnimations.length} animation clip(s)</strong>. {targetFormat} exports static meshes only. To keep full animations, select <strong className="font-semibold underline cursor-pointer" onClick={() => setTargetFormat('GLB')}>GLB</strong>.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Compression Level - Modern 2x2 Grid Tiles (Only for formats that support multi-tier compression, e.g. GLB for 3D, and images/videos) */}
            {!(mediaConfig.id === 'threed' && targetFormat !== 'GLB') && (
              <div>
                <span className="text-xs lg:text-[0.78vw] font-semibold text-slate-800 block mb-2 lg:mb-[0.5vw]">
                  Compression Level
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 lg:gap-[0.6vw]">
                  {mediaConfig.compressionLevels.map((lvl) => {
                    const isSelected = compressionSetting === lvl;
                    const parts = lvl.match(/^(.*?)\s*\((.*?)\)$/);
                    const title = parts ? parts[1].replace(' Quality', '').replace(' Compression', '') : lvl;
                    const detail = parts ? parts[2].replace('Quality', '').replace('Compression', '').trim() : '';

                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setCompressionSetting(lvl)}
                        className={`px-3 lg:px-[0.8vw] py-2 lg:py-[0.55vw] rounded-xl lg:rounded-[0.7vw] border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#ea543a] bg-orange-50/40 text-slate-900 shadow-2xs ring-1 ring-[#ea543a]/25'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs lg:text-[0.78vw] ${isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {title}
                          </span>
                          <div
                            className={`w-3.5 h-3.5 lg:w-[0.9vw] lg:h-[0.9vw] rounded-full flex items-center justify-center transition-colors shrink-0 ${
                              isSelected ? 'bg-[#ea543a] text-white' : 'border border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 lg:w-[0.6vw] lg:h-[0.6vw] stroke-[3]" />}
                          </div>
                        </div>

                        <span className={`text-[11px] lg:text-[0.68vw] font-mono leading-tight mt-1 lg:mt-[0.25vw] ${isSelected ? 'text-[#ea543a] font-medium' : 'text-slate-400'}`}>
                          {detail}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. AI Background Removal Toggle (Images Only & Hidden when JPG selected) */}
            {mediaConfig.id === 'image' && targetFormat !== 'JPG' && targetFormat !== 'JPEG' && (
              <div className="pt-2 lg:pt-[0.5vw] border-t border-slate-100">
                <div
                  onClick={() => setRemoveBackground((prev) => !prev)}
                  className={`p-3 lg:p-[0.7vw] rounded-xl lg:rounded-[0.7vw] border text-xs lg:text-[0.75vw] cursor-pointer flex items-center justify-between transition-all ${removeBackground
                    ? 'border-[#ea543a] bg-orange-50/50 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-1.5 lg:gap-[0.4vw] pr-2">
                    <Sparkles className="w-3.5 h-3.5 lg:w-[0.9vw] lg:h-[0.9vw] text-[#ea543a]" />
                    <span className="font-semibold text-slate-800 text-xs lg:text-[0.75vw]">
                      Remove Background
                    </span>
                  </div>

                  <div
                    className={`w-8 sm:w-9 lg:w-[2.2vw] h-4.5 sm:h-5 lg:h-[1.2vw] flex items-center rounded-full p-0.5 transition-colors shrink-0 ${removeBackground ? 'bg-[#ea543a]' : 'bg-slate-200'
                      }`}
                  >
                    <div
                      className={`bg-white w-3.5 sm:w-4 lg:w-[0.9vw] h-3.5 sm:h-4 lg:h-[0.9vw] rounded-full shadow-xs transform transition-transform ${removeBackground ? 'translate-x-3.5 sm:translate-x-4 lg:translate-x-[1vw]' : 'translate-x-0'
                        }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Action Button with Right Arrow */}
            <div className="pt-1 sm:pt-2 lg:pt-[0.4vw]">
              <button
                type="button"
                onClick={handleStartConversion}
                disabled={isProcessing}
                className="w-full py-2.5 sm:py-2.5 lg:py-[0.65vw] px-4 lg:px-[1vw] rounded-xl lg:rounded-[0.7vw] bg-slate-900 hover:bg-[#ea543a] text-white font-medium text-xs sm:text-sm lg:text-[0.8vw] shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 lg:gap-[0.5vw] group active:scale-98"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 lg:w-[1vw] lg:h-[1vw] animate-spin text-white" />
                    <span>Processing in browser...</span>
                  </>
                ) : (
                  <>
                    <span>Convert File</span>
                    <ArrowRight className="w-4 h-4 lg:w-[1vw] lg:h-[1vw] text-white group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Progress Status Bar */}
            {isProcessing && (
              <div
                ref={progressSectionRef}
                className="p-3 lg:p-[0.7vw] rounded-xl lg:rounded-[0.7vw] bg-slate-50 border border-slate-200 text-xs lg:text-[0.75vw] animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <div className="flex justify-between text-slate-700 font-semibold mb-1.5 lg:mb-[0.4vw] text-2xs lg:text-[0.68vw]">
                  <span>Processing</span>
                  <span className="text-[#ea543a] font-mono">{processProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 lg:h-[0.35vw] overflow-hidden mb-1.5 lg:mb-[0.4vw]">
                  <div
                    className="bg-[#ea543a] h-full rounded-full transition-all duration-300"
                    style={{ width: `${processProgress}%` }}
                  />
                </div>
                <p className="text-2xs lg:text-[0.65vw] text-slate-500 truncate">{processStatus}</p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Fullscreen Interactive Modal */}
      <MediaPreviewModal
        isOpen={Boolean(previewModalItem)}
        onClose={() => setPreviewModalItem(null)}
        mediaType={mediaConfig.id}
        item={previewModalItem}
        onDownload={handleDownloadFile}
      />

      {/* 3D Model Upload / Change Modal (Only for 3D Converter) */}
      {mediaConfig.id === 'threed' && isChangeModelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-[2vw] bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsChangeModelModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl lg:rounded-[1.2vw] w-full max-w-xl lg:max-w-[42vw] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 lg:px-[1.6vw] py-3.5 sm:py-4 lg:py-[1vw] border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3 lg:gap-[0.8vw]">
                <div className="w-9 sm:w-10 lg:w-[2.6vw] h-9 sm:h-10 lg:h-[2.6vw] rounded-xl lg:rounded-[0.7vw] bg-[#fff5f3] text-[#ea543a] flex items-center justify-center border border-[#ea543a]/15 shadow-2xs">
                  <Box className="w-4 sm:w-5 lg:w-[1.2vw] h-4 sm:h-5 lg:h-[1.2vw]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base lg:text-[1vw] font-semibold text-slate-900">Change 3D Model</h3>
                  <p className="text-xs lg:text-[0.72vw] text-slate-500">Upload a single 3D file, archive, or entire model folder</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangeModelModalOpen(false)}
                className="w-8 h-8 lg:w-[2vw] lg:h-[2vw] rounded-lg lg:rounded-[0.5vw] text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 lg:w-[1vw] lg:h-[1vw]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 lg:p-[1.6vw] space-y-3.5 sm:space-y-4 lg:space-y-[1vw]">
              {/* Hidden Inputs for Modal */}
              <input
                ref={modalSingleInputRef}
                type="file"
                accept={mediaConfig.accept}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0 && onFileSelect) {
                    onFileSelect(e.target.files);
                    setIsChangeModelModalOpen(false);
                  }
                  e.target.value = '';
                }}
              />

              <input
                ref={modalFolderInputRef}
                type="file"
                webkitdirectory="true"
                directory="true"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0 && onFileSelect) {
                    onFileSelect(e.target.files);
                    setIsChangeModelModalOpen(false);
                  }
                  e.target.value = '';
                }}
              />

              {/* Drag and Drop Box with click-to-upload */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setModalDragActive(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setModalDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setModalDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setModalDragActive(false);
                  if (onDropMedia && e.dataTransfer) {
                    onDropMedia(e.dataTransfer);
                    setIsChangeModelModalOpen(false);
                  } else if (e.dataTransfer?.files?.length && onFileSelect) {
                    onFileSelect(e.dataTransfer.files);
                    setIsChangeModelModalOpen(false);
                  }
                }}
                onClick={() => modalSingleInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl lg:rounded-[1vw] p-5 sm:p-7 lg:p-[1.8vw] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  modalDragActive
                    ? 'border-[#ea543a] bg-[#fff5f3] scale-[1.01]'
                    : 'border-slate-300 bg-slate-50/70 hover:bg-white hover:border-[#ea543a]'
                }`}
              >
                <div className="w-12 sm:w-14 lg:w-[3.4vw] h-12 sm:h-14 lg:h-[3.4vw] rounded-2xl lg:rounded-[0.9vw] bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center mb-2.5 sm:mb-3 lg:mb-[0.8vw] text-slate-700 group-hover:text-[#ea543a]">
                  <UploadCloud className="w-6 sm:w-7 lg:w-[1.8vw] h-6 sm:h-7 lg:h-[1.8vw] text-[#ea543a]" />
                </div>
                <p className="text-xs sm:text-sm lg:text-[0.85vw] font-semibold text-slate-800 mb-1">
                  Drag &amp; drop 3D file, ZIP, or folder here
                </p>
                <p className="text-[11px] sm:text-xs lg:text-[0.7vw] text-slate-400">or click to browse your computer</p>

                <div className="mt-2.5 sm:mt-3 lg:mt-[0.8vw] inline-flex items-center gap-1.5 px-2.5 sm:px-3 lg:px-[0.7vw] py-1 lg:py-[0.25vw] rounded-md lg:rounded-[0.4vw] bg-white border border-slate-200 text-[10px] sm:text-[11px] lg:text-[0.65vw] font-medium text-slate-600 shadow-2xs">
                  <span>Supported: GLB, GLTF, FBX, OBJ, STL, ZIP, RAR, 7Z</span>
                </div>
              </div>

              {/* Quick Actions (Upload Folder & Upload Archive / File) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-[0.8vw] pt-1">
                <button
                  type="button"
                  onClick={() => modalSingleInputRef.current?.click()}
                  className="px-3 sm:px-4 lg:px-[1vw] py-2.5 sm:py-3 lg:py-[0.7vw] rounded-xl lg:rounded-[0.7vw] border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium text-xs sm:text-sm lg:text-[0.8vw] flex items-center justify-center gap-2 lg:gap-[0.5vw] cursor-pointer transition-all shadow-xs"
                >
                  <FileArchive className="w-4 h-4 lg:w-[1vw] lg:h-[1vw] text-[#ea543a]" />
                  <span>Choose File or Zip</span>
                </button>

                <button
                  type="button"
                  onClick={() => modalFolderInputRef.current?.click()}
                  className="px-3 sm:px-4 lg:px-[1vw] py-2.5 sm:py-3 lg:py-[0.7vw] rounded-xl lg:rounded-[0.7vw] border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium text-xs sm:text-sm lg:text-[0.8vw] flex items-center justify-center gap-2 lg:gap-[0.5vw] cursor-pointer transition-all shadow-xs"
                >
                  <FolderUp className="w-4 h-4 lg:w-[1vw] lg:h-[1vw] text-emerald-600" />
                  <span>Choose Model Folder</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 lg:px-[1.6vw] py-3 sm:py-3.5 lg:py-[0.8vw] border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsChangeModelModalOpen(false)}
                className="px-3.5 sm:px-4 lg:px-[1vw] py-1.5 sm:py-2 lg:py-[0.5vw] text-xs lg:text-[0.75vw] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl lg:rounded-[0.6vw] cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
