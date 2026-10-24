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
  Maximize2
} from 'lucide-react';
import ThreePreviewCanvas from './ThreePreviewCanvas';
import MediaPreviewModal from './MediaPreviewModal';
import { processMediaFile } from './index';

export default function ConverterWorkspace({
  mediaConfig,
  fileItem,
  onBack,
  onFileSelect
}) {
  const localFileInputRef = useRef(null);
  const [targetFormat, setTargetFormat] = useState(mediaConfig.defaultOutput || mediaConfig.formats[0]);
  const [compressionSetting, setCompressionSetting] = useState(mediaConfig.compressionLevels[0]);

  // Dynamic file metadata (resolution, duration, vertex/polygon counts)
  const [fileDetails, setFileDetails] = useState(null);

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

      const result = {
        originalName: fileItem.name,
        newName,
        originalSize: fileItem.formattedSize,
        newSize: formatBytes(newSize),
        savedPercent,
        targetFormat,
        blobUrl,
        blob: convertedBlob
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
    <div className="w-full h-[93vh] max-h-[93vh] flex flex-col font-poppins text-slate-800 overflow-hidden bg-[#F1F5F9]">

      {/* 1. Header Toolbar */}
      <header className="shrink-0 h-14 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {mediaConfig.title} Converter
            </span>
            <span className="text-[10px] text-slate-500 bg-slate-100/90 border border-slate-200/60 px-1.5 py-0.5 rounded-full font-medium leading-none">
              Max {mediaConfig.maxSize?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Hidden File Input for Change File */}
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
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Replace className="w-3.5 h-3.5 text-slate-500" />
            <span>Change File</span>
          </button>

          {convertedResult && (
            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-4 py-1.5 rounded-lg bg-[#ea543a] hover:bg-[#d8482f] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Studio Grid */}
      <div className="flex-1 w-full max-w-[1580px] mx-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden items-stretch">

        {/* Left: Viewport / Canvas Showcase (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden h-full min-h-0">

          {/* Canvas Sub-Header */}
          <div className="shrink-0 px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-slate-800 text-xs font-semibold truncate max-w-xs sm:max-w-md">
                {fileItem.name}
              </span>
              <span className="text-2xs text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                {fileItem.formattedSize}
              </span>
            </div>

            {/* Controls right */}
            <div className="flex items-center gap-2 shrink-0">
              {/* 3D Auto Rotate */}
              {mediaConfig.id === 'threed' && (
                <button
                  type="button"
                  onClick={() => setAutoRotate3D((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${autoRotate3D
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <RotateCw className={`w-3 h-3 ${autoRotate3D ? 'text-emerald-600 animate-spin-slow' : 'text-slate-400'}`} />
                  <span>Rotation</span>
                </button>
              )}

              {/* View Selector Tabs */}
              {isConvertedReady && (
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${viewMode === 'split'
                      ? 'bg-white text-slate-900 shadow-xs font-medium'
                      : 'text-slate-600 hover:text-slate-900 font-normal'
                      }`}
                  >
                    Compare
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('original')}
                    className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${viewMode === 'original'
                      ? 'bg-white text-slate-900 shadow-xs font-medium'
                      : 'text-slate-600 hover:text-slate-900 font-normal'
                      }`}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('converted')}
                    className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${viewMode === 'converted'
                      ? 'bg-white text-slate-900 shadow-xs font-medium'
                      : 'text-slate-600 hover:text-slate-900 font-normal'
                      }`}
                  >
                    Output
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const display = isConvertedReady && viewMode !== 'original' ? convertedResult : fileItem;
                  setPreviewModalItem(display);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Viewing Stage */}
          <div className="flex-1 w-full p-4 bg-[#E2E8F0]/40 min-h-0 flex items-center justify-center overflow-hidden">

            {/* Split Comparison View */}
            {isConvertedReady && (
              <div className={`w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 ${viewMode === 'split' ? '' : 'hidden'}`}>

                {/* Left Card: Original */}
                <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden min-h-0 h-full shadow-2xs">
                  <div className="shrink-0 px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-2xs">
                    <span className="font-semibold text-slate-700">Original</span>
                    <span className="font-mono text-slate-500">{fileItem.formattedSize} • {fileItem.ext}</span>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden bg-slate-50/30">
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
                      />
                    )}
                  </div>
                </div>

                {/* Right Card: Output */}
                <div className="flex flex-col rounded-xl border border-emerald-200 bg-white overflow-hidden min-h-0 h-full shadow-2xs">
                  <div className="shrink-0 px-3.5 py-2 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between text-2xs">
                    <span className="font-semibold flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Converted Output
                    </span>
                    <span className="font-mono text-emerald-700 font-medium">
                      {convertedResult.newSize} • {convertedResult.targetFormat}
                      {convertedResult.savedPercent > 0 && ` (-${convertedResult.savedPercent}%)`}
                    </span>
                  </div>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden relative"
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
                />
              )}
            </div>

            {/* Single View: Converted */}
            {isConvertedReady && (
              <div className={`w-full h-full flex flex-col items-center justify-center relative min-h-0 overflow-hidden ${viewMode === 'converted' ? '' : 'hidden'
                }`}>
                {mediaConfig.id === 'image' && (
                  <div
                    className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
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
          <div className="shrink-0 px-5 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
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
                  {convertedResult.savedPercent > 0 && (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded text-2xs font-medium">
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
                className="text-slate-700 hover:text-[#ea543a] font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Result</span>
              </button>
            )}
          </div>

        </div>

        {/* Right: Studio Controls Panel (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 h-full overflow-y-auto pr-0.5">

          {/* Asset Info Card (Top) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight mb-4">Asset Details</h2>
            <div className="space-y-3.5 text-sm sm:text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-normal">File Name</span>
                <span className="text-slate-800 font-medium truncate max-w-[190px]" title={fileItem.name}>
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
              <div className="flex justify-between items-center pt-3.5 border-t border-slate-100">
                <span className="text-slate-500 font-normal">Target Format</span>
                <span className="text-[#ea543a] font-semibold bg-orange-50 px-3 py-1 rounded-lg border border-orange-200/80 text-xs tracking-wide">
                  {targetFormat}
                </span>
              </div>
            </div>
          </div>

          {/* Main Controls Card (Format & Quality - Bottom) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] flex flex-col gap-5">

            {/* Header */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">Format & Quality</h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Select your target format and compression balance</p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Target Format Selection (Clean segmented buttons with distinct separation) */}
            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                Output Format
              </span>
              <div className="grid grid-flow-col auto-cols-fr bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1">
                {mediaConfig.formats.map((fmt) => {
                  const isActive = targetFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-2 text-xs rounded-lg transition-all cursor-pointer text-center font-medium ${isActive
                        ? 'bg-[#ea543a] text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Compression Level - Modern 2x2 Grid Tiles */}
            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                Compression Level
              </span>

              <div className="grid grid-cols-2 gap-2.5">
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
                      className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#ea543a] bg-orange-50/40 text-slate-900 shadow-2xs ring-1 ring-[#ea543a]/25'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs ${isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {title}
                        </span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                            isSelected ? 'bg-[#ea543a] text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <span className={`text-[11px] font-mono leading-tight mt-1 ${isSelected ? 'text-[#ea543a] font-medium' : 'text-slate-400'}`}>
                        {detail}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. AI Background Removal Toggle (Images Only & Hidden when JPG selected) */}
            {mediaConfig.id === 'image' && targetFormat !== 'JPG' && targetFormat !== 'JPEG' && (
              <div className="pt-2 border-t border-slate-100">
                <div
                  onClick={() => setRemoveBackground((prev) => !prev)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${removeBackground
                    ? 'border-[#ea543a] bg-orange-50/50 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-1.5 pr-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#ea543a]" />
                    <span className="font-semibold text-slate-800 text-xs">
                      Remove Background
                    </span>
                  </div>

                  <div
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${removeBackground ? 'bg-[#ea543a]' : 'bg-slate-200'
                      }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${removeBackground ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Action Button with Right Arrow */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartConversion}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#ea543a] text-white font-medium text-xs sm:text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 group active:scale-98"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Processing in browser...</span>
                  </>
                ) : (
                  <>
                    <span>Convert File</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Progress Status Bar */}
            {isProcessing && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-700 font-semibold mb-1.5 text-2xs">
                  <span>Processing</span>
                  <span className="text-[#ea543a] font-mono">{processProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-1.5">
                  <div
                    className="bg-[#ea543a] h-full rounded-full transition-all duration-300"
                    style={{ width: `${processProgress}%` }}
                  />
                </div>
                <p className="text-2xs text-slate-500 truncate">{processStatus}</p>
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

    </div>
  );
}
