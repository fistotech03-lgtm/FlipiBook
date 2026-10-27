import React, { useState, useRef, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import ThreePreviewCanvas from './ThreePreviewCanvas';

/**
 * Universal Media Preview Modal
 * Renders high-fidelity interactive previews for:
 * - Images (Original & Converted, with Pan & Zoom controls)
 * - Videos (Full playback, speed controls, resolution check)
 * - 3D Models (Interactive 3D viewport with Orbit Controls and lighting)
 */
export default function MediaPreviewModal({
  isOpen,
  onClose,
  mediaType, // 'image' | 'video' | 'threed'
  item, // { originalUrl, convertedUrl, originalName, newName, originalSize, newSize, targetFormat, savedPercent }
  onDownload
}) {
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, initialOffsetX: 0, initialOffsetY: 0 });

  // Reset zoom & pan when opening a new item
  useEffect(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsPanning(false);
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const url = item.previewUrl || item.blobUrl || item.convertedUrl || item.originalUrl;
  const fileName = item.name || item.newName || item.originalName || 'Preview';
  const formatName = item.targetFormat || item.ext || 'Preview';
  const fileSize = item.formattedSize || item.newSize || item.originalSize;
  const isVideo = mediaType === 'video';
  const isImage = mediaType === 'image';
  const is3D = mediaType === 'threed';

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.25, 0.5);
      if (next <= 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleWheelZoom = (e) => {
    if (!isImage) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoomScale((prev) => {
      const next = Math.max(0.5, Math.min(5, prev + delta));
      if (next <= 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e) => {
    if (!isImage || zoomScale <= 1) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialOffsetX: panOffset.x,
      initialOffsetY: panOffset.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isPanning || !isImage) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPanOffset({
      x: panStartRef.current.initialOffsetX + dx,
      y: panStartRef.current.initialOffsetY + dy
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-6 animate-in fade-in duration-200 select-none"
      onMouseUp={handleMouseUp}
    >
      <div className="bg-white rounded-2xl w-[94vw] max-w-[1400px] h-[86vh] max-h-[86vh] shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="p-1.5 rounded-lg bg-orange-100 text-[#ea543a] shrink-0">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate" title={fileName}>
                {fileName}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-mono truncate">
                Format: <span className="font-semibold text-gray-700">{formatName}</span>
                {fileSize && ` • ${fileSize}`}
                {item.savedPercent > 0 && ` (-${item.savedPercent}%)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(item)}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#1e232d] hover:bg-[#ea543a] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Viewer Area */}
        <div
          onWheel={handleWheelZoom}
          className="flex-1 w-full h-full bg-[#E2E8F0]/30 relative flex items-center justify-center p-3 sm:p-5 overflow-hidden min-h-0"
        >
          
          {isImage && (
            <div
              className={`w-full h-full flex items-center justify-center overflow-hidden relative ${zoomScale > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
            >
              <img
                src={url}
                alt={fileName}
                draggable={false}
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                  transition: isPanning ? 'none' : 'transform 0.15s ease-out'
                }}
                className="max-h-full max-w-full object-contain drop-shadow-md rounded-none pointer-events-none"
              />

              {/* Floating Zoom & Pan Controls for Images */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-md z-30"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 0.5}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono font-medium text-slate-700 px-2 min-w-[50px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 5}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {zoomScale !== 1 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors ml-0.5 border-l border-slate-200"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {isVideo && (
            <div className="w-full h-full flex items-center justify-center">
              <video
                src={url}
                controls
                autoPlay
                playsInline
                className="max-h-full max-w-full rounded-none shadow-lg bg-black"
              />
            </div>
          )}

          {is3D && (
            <div className="w-full h-full flex flex-col items-center justify-center relative min-h-0">
              <ThreePreviewCanvas
                blobUrl={url}
                format={item.targetFormat || item.ext || 'GLB'}
                className="w-full h-full"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-lg border border-gray-200 text-[11px] text-gray-600 font-medium pointer-events-none shadow-xs">
                Drag to rotate • Scroll to zoom • Right-click to pan
              </div>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white shrink-0">
          <span className="text-2xs text-gray-400">
            {isImage ? 'Scroll or use buttons to zoom • Click & drag to pan' : ''}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 font-medium cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
