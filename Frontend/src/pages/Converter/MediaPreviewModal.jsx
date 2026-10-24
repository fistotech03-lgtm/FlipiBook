import React from 'react';
import { X, Download, ZoomIn } from 'lucide-react';
import ThreePreviewCanvas from './ThreePreviewCanvas';

/**
 * Universal Media Preview Modal
 * Renders high-fidelity interactive previews for:
 * - Images (Original & Converted)
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
  if (!isOpen || !item) return null;

  const url = item.previewUrl || item.blobUrl || item.convertedUrl || item.originalUrl;
  const fileName = item.name || item.newName || item.originalName || 'Preview';
  const formatName = item.targetFormat || item.ext || 'Preview';
  const fileSize = item.formattedSize || item.newSize || item.originalSize;
  const isVideo = mediaType === 'video';
  const isImage = mediaType === 'image';
  const is3D = mediaType === 'threed';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 rounded-lg bg-orange-100 text-[#ea543a]">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 truncate max-w-md" title={fileName}>
                {fileName}
              </h3>
              <p className="text-[11px] text-gray-500">
                Format: <span className="font-semibold text-gray-700">{formatName}</span>
                {fileSize && ` • Size: ${fileSize}`}
                {item.savedPercent > 0 && ` (-${item.savedPercent}%)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(item)}
                className="px-3.5 py-1.5 rounded-lg bg-[#1e232d] hover:bg-[#ea543a] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Viewer Area */}
        <div className="flex-1 bg-slate-900/5 relative min-h-[350px] sm:min-h-[440px] flex items-center justify-center p-4 overflow-hidden">
          
          {isImage && (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={url}
                alt={fileName}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          )}

          {isVideo && (
            <div className="w-full h-full flex items-center justify-center">
              <video
                src={url}
                controls
                autoPlay
                playsInline
                className="max-h-[60vh] max-w-full rounded-lg shadow-md bg-black"
              />
            </div>
          )}

          {is3D && (
            <div className="w-full h-full flex flex-col items-center justify-center relative min-h-[380px]">
              <ThreePreviewCanvas
                blobUrl={url}
                format={item.targetFormat || 'GLB'}
                className="w-full h-[380px] sm:h-[420px]"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-lg border border-gray-200 text-[11px] text-gray-600 font-medium pointer-events-none shadow-xs">
                Drag to rotate • Scroll to zoom • Right-click to pan
              </div>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          <span>Processed 100% in browser memory</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
