import React, { useState } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Check,
  AlertCircle,
  Eye,
  Replace,
  Columns,
  FileCheck,
  Zap,
  RotateCw
} from 'lucide-react';
import ThreePreviewCanvas from './ThreePreviewCanvas';
import MediaPreviewModal from './MediaPreviewModal';
import { processMediaFile } from './index';

export default function ConverterWorkspace({
  mediaConfig,
  fileItem,
  onBack,
  fileInputRef
}) {
  const [targetFormat, setTargetFormat] = useState(mediaConfig.defaultOutput || mediaConfig.formats[0]);
  const [compressionSetting, setCompressionSetting] = useState(mediaConfig.compressionLevels[0]);

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

  const formatBytes = (bytes = 0) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleStartConversion = async () => {
    if (!fileItem?.file) return;

    setIsProcessing(true);
    setProcessProgress(5);
    setErrorMessage(null);
    setProcessStatus('Preparing...');

    try {
      const convertedBlob = await processMediaFile({
        file: fileItem.file,
        mediaType: mediaConfig.id,
        targetFormat,
        compressionPreset: compressionSetting,
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
      setProcessStatus('Done!');
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

  return (
    <div className="w-full h-[93vh] max-h-[93vh] flex flex-col font-poppins text-gray-900 overflow-hidden bg-[#F8FAFC]">
      
      {/* Studio Top Control Strip */}
      <div className="shrink-0 h-13 bg-white border-b border-gray-200 px-5 sm:px-8 flex items-center justify-between z-10 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-950 px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="h-5 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-none">
              {mediaConfig.title} Studio
            </h1>
            <span className="text-xs text-gray-500 font-medium">
              (Max {mediaConfig.maxSize?.label})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {convertedResult && (
            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-4 py-1.5 rounded-lg bg-[#ea543a] hover:bg-[#d5452e] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef?.current?.click()}
            className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Replace className="w-4 h-4" />
            <span>Change File</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1580px] mx-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-y-auto lg:overflow-hidden items-stretch">
        
        {/* Left: Interactive Preview Canvas Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden h-[440px] lg:h-full min-h-0">
          
          {/* Canvas Top Bar */}
          <div className="shrink-0 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between bg-white text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 truncate pr-3">
              <FileCheck className="w-4 h-4 text-[#ea543a] shrink-0" />
              <span className="font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                {fileItem.name}
              </span>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                {fileItem.formattedSize}
              </span>
            </div>

            {/* View Mode Controls & 3D Rotate Toggle */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* 3D Auto Rotate Toggle Button */}
              {mediaConfig.id === 'threed' && (
                <button
                  type="button"
                  onClick={() => setAutoRotate3D((prev) => !prev)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    autoRotate3D
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                  title={autoRotate3D ? 'Turn off auto rotate' : 'Turn on auto rotate'}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${autoRotate3D ? 'text-emerald-600 animate-spin-slow' : 'text-gray-400'}`} />
                  <span>Auto Rotate: {autoRotate3D ? 'On' : 'Off'}</span>
                </button>
              )}

              {isConvertedReady && (
                <div className="flex items-center border border-gray-300 rounded-lg p-0.5 bg-gray-50 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${
                      viewMode === 'split' ? 'bg-gray-900 text-white font-semibold shadow-2xs' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Side by Side</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('original')}
                    className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'original' ? 'bg-gray-900 text-white font-semibold shadow-2xs' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('converted')}
                    className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'converted' ? 'bg-gray-900 text-white font-semibold shadow-2xs' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Converted
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const display = isConvertedReady && viewMode !== 'original' ? convertedResult : fileItem;
                  setPreviewModalItem(display);
                }}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-700 hover:text-gray-950 hover:bg-gray-100 cursor-pointer"
                title="Fullscreen"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewport Canvas */}
          <div className="flex-1 w-full p-3 sm:p-4 bg-slate-100/60 min-h-0 flex items-center justify-center overflow-hidden">
            
            {/* Split View */}
            {isConvertedReady && viewMode === 'split' ? (
              <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
                
                {/* Left: Original */}
                <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xs min-h-0 h-full">
                  <div className="shrink-0 px-3.5 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">Original File</span>
                    <span className="text-gray-600 font-semibold">{fileItem.formattedSize} • {fileItem.ext}</span>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center p-3 bg-slate-50 overflow-hidden">
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

                {/* Right: Converted */}
                <div className="flex flex-col rounded-xl border border-emerald-400 bg-white overflow-hidden shadow-2xs min-h-0 h-full">
                  <div className="shrink-0 px-3.5 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Converted Output
                    </span>
                    <span className="text-emerald-800 font-bold">
                      {convertedResult.newSize} • {convertedResult.targetFormat}
                      {convertedResult.savedPercent > 0 && ` (-${convertedResult.savedPercent}%)`}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center p-3 bg-slate-50 overflow-hidden">
                    {mediaConfig.id === 'image' && (
                      <img src={convertedResult.blobUrl} alt="Converted" className="max-h-full max-w-full object-contain" />
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
            ) : (
              /* Single View */
              <div className="w-full h-full flex flex-col items-center justify-center relative min-h-0 overflow-hidden">
                <div className="absolute top-2.5 left-2.5 z-10 text-xs font-bold px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-800 shadow-xs backdrop-blur-xs">
                  {isConvertedReady && viewMode === 'converted' ? 'Converted Preview' : 'Original Preview'}
                </div>

                {mediaConfig.id === 'image' && (
                  <img
                    src={isConvertedReady && viewMode === 'converted' ? convertedResult.blobUrl : fileItem.previewUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                )}

                {mediaConfig.id === 'video' && (
                  <video
                    key={isConvertedReady && viewMode === 'converted' ? convertedResult.blobUrl : fileItem.previewUrl}
                    src={isConvertedReady && viewMode === 'converted' ? convertedResult.blobUrl : fileItem.previewUrl}
                    controls
                    className="max-h-full max-w-full bg-black rounded"
                  />
                )}

                {mediaConfig.id === 'threed' && (
                  <ThreePreviewCanvas
                    key={isConvertedReady && viewMode === 'converted' ? convertedResult.blobUrl : fileItem.previewUrl}
                    blobUrl={isConvertedReady && viewMode === 'converted' ? convertedResult.blobUrl : fileItem.previewUrl}
                    format={isConvertedReady && viewMode === 'converted' ? convertedResult.targetFormat : fileItem.ext}
                    autoRotate={autoRotate3D}
                    className="w-full h-full"
                  />
                )}
              </div>
            )}

          </div>

          {/* Bottom Bar: Stats & Quick Download */}
          <div className="shrink-0 px-4 py-2 bg-white border-t border-gray-200 flex items-center justify-between text-xs sm:text-sm text-gray-800">
            {isConvertedReady ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-medium">Original: <strong className="text-gray-950 font-bold">{fileItem.formattedSize}</strong></span>
                <span className="text-gray-400 font-bold">→</span>
                <span className="text-emerald-700 font-bold">Optimized: {convertedResult.newSize}</span>
                {convertedResult.savedPercent > 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                    Saved {convertedResult.savedPercent}%
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-500 font-medium">
                Choose format and compression on the right, then click Convert & Compress.
              </span>
            )}

            {isConvertedReady && (
              <button
                type="button"
                onClick={handleDownloadFile}
                className="px-3.5 py-1.5 rounded-lg bg-[#ea543a] hover:bg-[#d5452e] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Result</span>
              </button>
            )}
          </div>

        </div>

        {/* Right: Settings & Details Sidebar (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3 min-h-0 h-full overflow-hidden">
          
          {/* Main Settings Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
            
            <div className="border-b border-gray-200 pb-2.5">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">Conversion Settings</h2>
              <p className="text-xs text-gray-500 mt-1">Configure format and output compression</p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Format Selection */}
            <div>
              <label className="text-xs font-bold text-gray-800 mb-2 block uppercase tracking-wider">
                Target Format
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                {mediaConfig.formats.map((fmt) => {
                  const isActive = targetFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Compression Preset */}
            <div>
              <label className="text-xs font-bold text-gray-800 mb-2 block uppercase tracking-wider">
                Compression Level
              </label>

              <div className="space-y-1.5">
                {mediaConfig.compressionLevels.map((lvl) => {
                  const isSelected = compressionSetting === lvl;
                  return (
                    <div
                      key={lvl}
                      onClick={() => setCompressionSetting(lvl)}
                      className={`p-2.5 rounded-lg border text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'border-[#ea543a] bg-orange-50 font-bold text-gray-950 ring-1 ring-[#ea543a]'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{lvl}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#ea543a] bg-[#ea543a]' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleStartConversion}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-[#ea543a] hover:bg-[#d5452e] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing in Browser...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Convert & Compress</span>
                  </>
                )}
              </button>
            </div>

            {/* Progress Status */}
            {isProcessing && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                <div className="flex justify-between text-gray-800 font-bold mb-1.5">
                  <span>Converting</span>
                  <span className="text-[#ea543a] font-extrabold">{processProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-1.5">
                  <div
                    className="bg-[#ea543a] h-full rounded-full transition-all duration-300"
                    style={{ width: `${processProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 truncate font-medium">{processStatus}</p>
              </div>
            )}

          </div>

          {/* File Metadata Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col gap-2 text-xs">
            <span className="font-bold text-gray-900 uppercase tracking-wider text-xs">File Details</span>
            <div className="space-y-1.5 text-gray-700 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">File Name:</span>
                <span className="font-semibold text-gray-900 truncate max-w-[180px]">{fileItem.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Format:</span>
                <span className="font-semibold text-gray-900">{fileItem.ext}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Original Size:</span>
                <span className="font-semibold text-gray-900">{fileItem.formattedSize}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Target Format:</span>
                <span className="font-bold text-[#ea543a]">{targetFormat}</span>
              </div>
            </div>
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
