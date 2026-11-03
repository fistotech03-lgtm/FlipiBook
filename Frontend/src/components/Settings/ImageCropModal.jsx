import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { X, Check, ZoomIn, ZoomOut, RotateCw, RefreshCw } from 'lucide-react';
import { resolveUploadsPath, BACKEND_URL } from '../../utils/assetUtils';

/**
 * ImageCropModal
 * Interactive Canvas-based Image Cropper with zoom, pan, rotation, and preview.
 * Supports 'avatar' (circular mask, 1:1) and 'banner' (widescreen aspect ratio).
 */
const ImageCropModal = ({
  isOpen,
  onClose,
  imageSrc,
  cropType = 'avatar', // 'avatar' | 'banner'
  onCropComplete,
  title = 'Crop Image',
  aspectRatio: customAspectRatio
}) => {
  const [image, setImage] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);

  const containerRef = useRef(null);
  const stageRef = useRef(null);

  // Aspect ratio configuration: avatar is 1:1 (circular), banner matches Profile banner (~8.38:1 widescreen)
  const isAvatar = cropType === 'avatar';
  const aspectRatio = customAspectRatio || (isAvatar ? 1 : 8.38);

  // Viewport dimensions for crop box (compact height tailored to fit the 9.5vw profile banner)
  const cropBoxWidth = isAvatar ? 320 : 660;
  const cropBoxHeight = Math.round(cropBoxWidth / aspectRatio);

  // Load image when imageSrc changes using multi-strategy loader
  useEffect(() => {
    if (!imageSrc || !isOpen) {
      setImage(null);
      setIsLoadingImage(false);
      return;
    }

    let isCancelled = false;
    let objectUrlToRevoke = null;
    setIsLoadingImage(true);

    const loadImage = async () => {
      try {
        // Strategy 1: Native File or Blob object
        if (imageSrc instanceof File || imageSrc instanceof Blob) {
          const blobUrl = URL.createObjectURL(imageSrc);
          objectUrlToRevoke = blobUrl;
          const img = new Image();
          img.onload = () => {
            if (!isCancelled) {
              setImage(img);
              setIsLoadingImage(false);
              setZoom(1);
              setRotation(0);
              setPosition({ x: 0, y: 0 });
            }
          };
          img.onerror = (err) => {
            console.error('Failed loading file/blob image:', err);
            if (!isCancelled) setIsLoadingImage(false);
          };
          img.src = blobUrl;
          return;
        }

        // Strategy 2: URL or Data URI string
        if (typeof imageSrc === 'string') {
          let resolvedSrc = resolveUploadsPath(imageSrc);

          // Normalize any localhost/127.0.0.1 or BACKEND_URL storage paths to same-origin relative /storage/...
          // In Vite dev (and Nginx prod), /storage/ is already proxied on the exact same origin!
          // Same-origin images will NEVER taint the canvas!
          if (resolvedSrc.includes('/storage/') || resolvedSrc.includes('/uploads/')) {
            resolvedSrc = resolvedSrc
              .replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/storage\//i, '/storage/')
              .replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/uploads\//i, '/storage/');
            if (BACKEND_URL && resolvedSrc.startsWith(BACKEND_URL)) {
              resolvedSrc = resolvedSrc.slice(BACKEND_URL.length);
            }
          }

          // Data URI or Blob URL: load directly without CORS requirement
          if (resolvedSrc.startsWith('data:') || resolvedSrc.startsWith('blob:')) {
            const img = new Image();
            img.onload = () => {
              if (!isCancelled) {
                setImage(img);
                setIsLoadingImage(false);
                setZoom(1);
                setRotation(0);
                setPosition({ x: 0, y: 0 });
              }
            };
            img.onerror = (err) => {
              console.error('Failed loading data/blob URI image:', err);
              if (!isCancelled) setIsLoadingImage(false);
            };
            img.src = resolvedSrc;
            return;
          }

          const onImgLoaded = (imgEl) => {
            if (!isCancelled) {
              setImage(imgEl);
              setIsLoadingImage(false);
              setZoom(1);
              setRotation(0);
              setPosition({ x: 0, y: 0 });
            }
          };

          // Step A: Fetch as a Blob with cache-buster (bypasses browser non-CORS cached response)
          try {
            const sep = resolvedSrc.includes('?') ? '&' : '?';
            const fetchUrl = `${resolvedSrc}${sep}cbust=${Date.now()}`;
            const res = await fetch(fetchUrl);
            if (res.ok) {
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              objectUrlToRevoke = blobUrl;
              const img = new Image();
              img.onload = () => onImgLoaded(img);
              img.onerror = (e) => console.error('Blob URL failed to load into image:', e);
              img.src = blobUrl;
              return;
            }
          } catch (fetchErr) {
            console.warn('Fetch image as blob failed, attempting direct Image load:', fetchErr);
          }

          // Step B: Image load with crossOrigin = 'anonymous' (with cache-buster)
          const imgAnonymous = new Image();
          imgAnonymous.crossOrigin = 'anonymous';
          imgAnonymous.onload = () => onImgLoaded(imgAnonymous);
          imgAnonymous.onerror = () => {
            // Step C: Fallback to direct load without crossOrigin
            console.warn('CORS anonymous load failed. Trying direct fallback.');
            const imgDirect = new Image();
            imgDirect.onload = () => onImgLoaded(imgDirect);
            imgDirect.onerror = (err) => {
              console.error('All image loading strategies failed:', err);
              if (!isCancelled) setIsLoadingImage(false);
            };
            imgDirect.src = resolvedSrc;
          };

          const sep = resolvedSrc.includes('?') ? '&' : '?';
          imgAnonymous.src = `${resolvedSrc}${sep}cbust=${Date.now()}`;
        }
      } catch (err) {
        console.error('Error during image loading in crop modal:', err);
        if (!isCancelled) setIsLoadingImage(false);
      }
    };

    loadImage();

    return () => {
      isCancelled = true;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [imageSrc, isOpen]);

  // Non-passive wheel event listener to eliminate "[Violation] Unable to preventDefault inside passive event listener invocation"
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [isOpen]);

  // Mouse / Touch handlers for panning
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Generate cropped output on high-res Canvas
  const handleApplyCrop = async () => {
    if (!image) return;
    setIsExporting(true);

    try {
      // Output canvas dimension
      const outputWidth = isAvatar ? 800 : 1920;
      const outputHeight = Math.round(outputWidth / aspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');

      // Clear
      ctx.clearRect(0, 0, outputWidth, outputHeight);

      // Save context
      ctx.save();

      // If avatar, clip to circle for output
      if (isAvatar) {
        ctx.beginPath();
        ctx.arc(outputWidth / 2, outputHeight / 2, outputWidth / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
      }

      // Move origin to center of output canvas
      ctx.translate(outputWidth / 2, outputHeight / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Compute scale factor between crop box on screen and high-res output canvas
      const scaleMultiplier = outputWidth / cropBoxWidth;

      // Position offset scaled
      const adjustedPosX = position.x * scaleMultiplier;
      const adjustedPosY = position.y * scaleMultiplier;

      // Fit image base size into crop box
      const isRotated90or270 = rotation % 180 !== 0;
      const naturalW = isRotated90or270 ? image.naturalHeight : image.naturalWidth;
      const naturalH = isRotated90or270 ? image.naturalWidth : image.naturalHeight;

      // Calculate initial base scale to cover the crop box
      const scaleX = cropBoxWidth / naturalW;
      const scaleY = cropBoxHeight / naturalH;
      const baseScale = Math.max(scaleX, scaleY);

      const renderW = image.naturalWidth * baseScale * zoom * scaleMultiplier;
      const renderH = image.naturalHeight * baseScale * zoom * scaleMultiplier;

      // Draw centered
      ctx.drawImage(
        image,
        -renderW / 2 + (isRotated90or270 ? adjustedPosY : adjustedPosX),
        -renderH / 2 + (isRotated90or270 ? -adjustedPosX : adjustedPosY),
        renderW,
        renderH
      );

      ctx.restore();

      // Export as Blob & DataURL
      const mimeType = isAvatar ? 'image/png' : 'image/jpeg';
      const quality = isAvatar ? 1.0 : 0.92;

      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            setIsExporting(false);
            return;
          }

          const fileName = `${cropType}_cropped_${Date.now()}.${isAvatar ? 'png' : 'jpg'}`;
          const croppedFile = new File([blob], fileName, { type: mimeType });
          let croppedDataUrl = '';
          try {
            croppedDataUrl = canvas.toDataURL(mimeType, quality);
          } catch (e) {
            croppedDataUrl = URL.createObjectURL(blob);
          }

          onCropComplete?.(croppedFile, croppedDataUrl);
          setIsExporting(false);
          onClose?.();
        }, mimeType, quality);
      } catch (taintErr) {
        console.warn('Canvas export failed due to taint, using fallback:', taintErr);
        setIsExporting(false);
        // Fallback: don't crash or freeze; pass original image to complete crop gracefully
        onCropComplete?.(imageSrc instanceof File ? imageSrc : null, typeof imageSrc === 'string' ? imageSrc : image.src);
        onClose?.();
      }
    } catch (err) {
      console.error('Error generating cropped image:', err);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  // Base dimensions calculation for preview
  const isRotated90or270 = rotation % 180 !== 0;
  const naturalW = image ? (isRotated90or270 ? image.naturalHeight : image.naturalWidth) : 1;
  const naturalH = image ? (isRotated90or270 ? image.naturalWidth : image.naturalHeight) : 1;
  const scaleX = cropBoxWidth / naturalW;
  const scaleY = cropBoxHeight / naturalH;
  const baseScale = Math.max(scaleX, scaleY);

  const previewWidth = image ? image.naturalWidth * baseScale * zoom : 0;
  const previewHeight = image ? image.naturalHeight * baseScale * zoom : 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-[1vw] animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[1vw] shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-w-[95vw] max-h-[95vh]"
        style={{ width: `${Math.max(cropBoxWidth + 48, 520)}px` }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-[1.2vw] py-[0.8vw] border-b border-gray-100">
          <div className="flex items-center gap-[0.5vw]">
            <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Icon icon={isAvatar ? 'solar:user-bold' : 'solar:gallery-wide-bold'} className="w-[1.1vw] h-[1.1vw]" />
            </div>
            <div>
              <h3 className="text-[1vw] font-bold text-gray-900 leading-tight">
                {title || (isAvatar ? 'Crop Profile Avatar' : 'Crop Banner Image')}
              </h3>
              <p className="text-[0.7vw] text-gray-400 mt-[0.1vw]">
                Drag to reposition or use zoom controls to frame your {isAvatar ? 'avatar' : 'banner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-[0.35vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-[1.2vw] h-[1.2vw]" />
          </button>
        </div>

        {/* Crop Stage Area with balanced top and bottom breathing room */}
        <div 
          ref={stageRef}
          className={`relative bg-[#18191c] flex items-center justify-center select-none overflow-hidden ${
            isAvatar ? 'p-[2vw]' : 'py-7 sm:py-[1.6vw] px-6 sm:px-[1.5vw]'
          }`}
          style={{ minHeight: `${cropBoxHeight + (isAvatar ? 60 : 56)}px` }}
        >
          {/* Active Crop Box */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ${
              isAvatar ? 'rounded-full' : 'rounded-[0.6vw]'
            }`}
            style={{
              width: `${cropBoxWidth}px`,
              height: `${cropBoxHeight}px`,
              touchAction: 'none'
            }}
          >
            {/* Loading state indicator */}
            {isLoadingImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20 text-white/90 gap-[0.5vw]">
                <Icon icon="line-md:loading-loop" className="w-[2vw] h-[2vw] text-emerald-400" />
                <span className="text-[0.75vw] font-medium tracking-wide">Loading image...</span>
              </div>
            )}

            {/* Image being dragged/zoomed */}
            {image && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`
                }}
              >
                <img
                  src={image.src}
                  alt="Crop preview"
                  draggable={false}
                  className="max-w-none pointer-events-none"
                  style={{
                    width: `${previewWidth}px`,
                    height: `${previewHeight}px`,
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    willChange: 'transform'
                  }}
                />
              </div>
            )}

            {/* Rule of thirds grid lines */}
            <div className="absolute inset-0 pointer-events-none opacity-25 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-white"></div>
              <div className="border-r border-white"></div>
              <div></div>
            </div>
          </div>
        </div>

        {/* Toolbar & Controls */}
        <div className="px-[1.5vw] py-[0.9vw] bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-[1.5vw]">
          {/* Zoom Controls */}
          <div className="flex items-center gap-[0.6vw] flex-1">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.5))}
              className="p-[0.35vw] text-gray-500 hover:text-gray-800 hover:bg-white rounded-md transition-all shadow-2xs border border-gray-200"
              title="Zoom out"
            >
              <ZoomOut className="w-[1vw] h-[1vw]" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-emerald-600 h-[0.3vw] bg-gray-200 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(prev + 0.1, 3))}
              className="p-[0.35vw] text-gray-500 hover:text-gray-800 hover:bg-white rounded-md transition-all shadow-2xs border border-gray-200"
              title="Zoom in"
            >
              <ZoomIn className="w-[1vw] h-[1vw]" />
            </button>
            <span className="text-[0.72vw] font-medium text-gray-500 min-w-[2.5vw] text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Quick Tool buttons: Rotate & Reset */}
          <div className="flex items-center gap-[0.5vw]">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-[0.3vw] px-[0.6vw] py-[0.4vw] text-[0.75vw] font-medium text-gray-600 bg-white border border-gray-200 rounded-[0.4vw] hover:bg-gray-100 transition-colors cursor-pointer shadow-2xs"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-[0.9vw] h-[0.9vw]" />
              <span>Rotate</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-[0.3vw] px-[0.6vw] py-[0.4vw] text-[0.75vw] font-medium text-gray-600 bg-white border border-gray-200 rounded-[0.4vw] hover:bg-gray-100 transition-colors cursor-pointer shadow-2xs"
              title="Reset position and zoom"
            >
              <RefreshCw className="w-[0.9vw] h-[0.9vw]" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-[1.5vw] py-[0.9vw] bg-white border-t border-gray-100 flex items-center justify-end gap-[0.8vw]">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-[1.1vw] py-[0.5vw] border border-gray-300 rounded-[0.5vw] text-[0.82vw] font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isExporting || !image}
            className="flex items-center gap-[0.4vw] px-[1.2vw] py-[0.5vw] bg-emerald-600 hover:bg-emerald-700 text-white rounded-[0.5vw] text-[0.82vw] font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <Icon icon="line-md:loading-loop" className="w-[1vw] h-[1vw]" />
            ) : (
              <Check className="w-[1vw] h-[1vw]" strokeWidth={2.5} />
            )}
            <span>{isExporting ? 'Applying...' : 'Apply Crop'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
