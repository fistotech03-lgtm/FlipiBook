import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  ChevronRight,
  Link,
  FileText,
  Video
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { useToast } from '../../CustomToast';
import { useAuth } from '../../../context/AuthContext';
import { checkIsAnimatedWebp } from '../utils/editorUtils';
import ImportViaUrlModal from '../modals/ImportViaUrlModal';
import MediaGalleryPopup from '../modals/MediaGalleryPopup';

const UploadProperties = ({ activePageIndex, setActiveMainTool }) => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const browseGalleryBtnRef = useRef(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const compressImage = (dataUrl, maxWidth = 1200, maxHeight = 1200) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        const isPng = dataUrl.startsWith('data:image/png');

        // If it's already small enough, no need to downscale
        if (width <= maxWidth && height <= maxHeight) {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.75));
          return;
        }

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = dataUrl;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Switch to cursor tool instantly
    if (setActiveMainTool) {
      setActiveMainTool('select');
    }

    // Limit raw file size to 20MB
    if (file.size > 20 * 1024 * 1024) {
      alert("File is too large! Please upload images smaller than 20MB.");
      e.target.value = '';
      return;
    }

    const isVideo = file.type.startsWith('video/');
    let isGif = file.type === 'image/gif';
    if (!isGif && file.type.includes('webp')) {
      isGif = await checkIsAnimatedWebp(file);
    }
    const isSvg = file.type === 'image/svg+xml';

    if (!file.type.startsWith('image/') && !isVideo && !isGif && !isSvg) {
      toast.error('Only Image, Video, and GIF formats are allowed.');
      e.target.value = '';
      return;
    }

    if ((isVideo || isGif) && !user) {
      alert(`You must be logged in to upload ${isVideo ? 'videos' : 'GIFs'}.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;

      let finalUrl = dataUrl;
      // Skip compression for GIFs, SVGs, and Videos to preserve quality
      if (!isGif && !isSvg && !isVideo) {
        finalUrl = await compressImage(dataUrl);
      }

      if (isVideo) {
        const tempVid = document.createElement('video');
        tempVid.onloadedmetadata = () => {
          window.dispatchEvent(new CustomEvent('upload-video-to-editor', {
            detail: {
              videoUrl: finalUrl,
              pageIndex: activePageIndex,
              file,
              isTemporary: true,
              videoWidth: tempVid.videoWidth,
              videoHeight: tempVid.videoHeight,
              isPortrait: tempVid.videoHeight > tempVid.videoWidth
            }
          }));
        };
        tempVid.onerror = () => {
          window.dispatchEvent(new CustomEvent('upload-video-to-editor', {
            detail: { videoUrl: finalUrl, pageIndex: activePageIndex, file, isTemporary: true }
          }));
        };
        tempVid.src = finalUrl;
      } else {
        // Dispatch event to MainEditor
        window.dispatchEvent(new CustomEvent('upload-image-to-editor', {
          detail: {
            dataUrl: finalUrl,
            pageIndex: activePageIndex,
            dataType: isSvg ? 'svg' : (isGif ? 'gif' : 'image')
          }
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  return (
    <>
      <div className="bg-white px-[1.2vw] pt-[1.1vw] pb-[1.5vw] flex flex-col gap-[1.2vw] flex-1 overflow-y-auto custom-scrollbar h-full justify-between select-none">
        {/* Top Content */}
        <div className="flex flex-col gap-[1vw]">
          {/* Header */}
          <div className="flex items-center gap-[0.8vw]">
            <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">Upload Files</span>
            <div className="flex-1 h-[1px] bg-gray-200" />
          </div>

          {/* Drag & Drop Box */}
          <div
            onClick={handleUploadClick}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                handleFileChange({ target: { files: files } });
              }
            }}
            className="w-full border-2 border-dashed border-gray-300 rounded-[0.5vw] bg-white p-[1.1vw] flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[#4c5add] hover:bg-gray-50/50 group shadow-2xs"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*,.gif,.svg"
              onChange={handleFileChange}
            />
            <div className="text-[0.82vw] font-medium text-gray-800 mb-[0.4vw]">
              Drag & Drop or <span className="text-[#4c5add] font-semibold">Upload</span>
            </div>
            <div className="mb-[0.45vw] text-gray-400 group-hover:text-[#4c5add] transition-colors">
              <Upload size="1.3vw" strokeWidth={1.75} />
            </div>
            <div className="text-center">
              <div className="text-[0.75vw] font-medium text-gray-700 mb-[0.1vw]">Supported Files</div>
              <div className="text-[0.7vw] text-gray-500 font-normal">Image, Video, GIF, SVG</div>
            </div>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-[0.6vw] my-[0.1vw]">
            <div className="flex-1 h-[1px] bg-gray-100" />
            <span className="text-[0.68vw] font-semibold text-gray-400 tracking-wider">OR</span>
            <div className="flex-1 h-[1px] bg-gray-100" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-[0.6vw]">
            {/* Browse by Gallery */}
            <button
              ref={browseGalleryBtnRef}
              onClick={() => setIsMediaGalleryOpen(true)}
              className="w-full rounded-[0.5vw] p-[0.6vw] px-[0.8vw] bg-[#0c0f17] hover:bg-black text-white flex items-center justify-between shadow-2xs cursor-pointer transition-all border border-gray-800 group relative overflow-hidden"
            >
              <div className="flex items-center gap-[0.6vw]">
                <div className="w-[1.9vw] h-[1.9vw] rounded-[0.4vw] bg-white text-gray-900 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <ImageIcon size="1vw" />
                </div>
                <span className="text-[0.82vw] font-medium text-white tracking-wide">Browse by Gallery</span>
              </div>
              <ChevronRight size="0.9vw" className="text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {/* Import via URL */}
            <button
              onClick={() => setIsUrlModalOpen(true)}
              className="w-full rounded-[0.5vw] p-[0.6vw] px-[0.8vw] bg-[#3195ff] hover:bg-[#2087f5] text-white flex items-center justify-between shadow-2xs cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-[0.6vw]">
                <div className="w-[1.9vw] h-[1.9vw] rounded-[0.4vw] bg-white text-[#3195ff] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Link size="1vw" />
                </div>
                <span className="text-[0.82vw] font-medium text-white tracking-wide">Import via URL</span>
              </div>
              <ChevronRight size="0.9vw" className="text-white/80 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* URL Import Card (Pushed to bottom) */}
        <div className="mt-auto bg-white rounded-[0.5vw] border border-gray-200 p-[0.9vw] shadow-2xs flex flex-col gap-[0.7vw]">
          <div className="flex items-center gap-[0.45vw]">
            <Link size="0.95vw" className="text-[#3195ff]" />
            <span className="text-[0.82vw] font-semibold text-gray-900">URL Import</span>
          </div>
          <p className="text-[0.75vw] text-gray-500 font-normal">
            You can import the following from a URL:
          </p>

          {/* 3 Horizontal Mini Cards */}
          <div className="grid grid-cols-3 gap-[0.4vw] my-[0.1vw]">
            {/* Images */}
            <div className="bg-gray-50/80 border border-gray-200/80 rounded-[0.4vw] p-[0.45vw] flex items-center gap-[0.35vw]">
              <div className="w-[1.4vw] h-[1.4vw] rounded-[0.35vw] bg-blue-100/60 text-blue-600 flex items-center justify-center flex-shrink-0">
                <ImageIcon size="0.8vw" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[0.72vw] font-semibold text-gray-900 leading-tight">Images</span>
                <span className="text-[0.62vw] text-gray-500 font-medium truncate">JPG, PNG, SVG</span>
              </div>
            </div>

            {/* PDF */}
            <div className="bg-gray-50/80 border border-gray-200/80 rounded-[0.4vw] p-[0.45vw] flex items-center gap-[0.35vw]">
              <div className="w-[1.4vw] h-[1.4vw] rounded-[0.35vw] bg-red-100/60 text-red-500 flex items-center justify-center flex-shrink-0">
                <FileText size="0.8vw" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[0.72vw] font-semibold text-gray-900 leading-tight">PDF</span>
                <span className="text-[0.62vw] text-gray-500 font-medium truncate">PDF Docs</span>
              </div>
            </div>

            {/* Videos */}
            <div className="bg-gray-50/80 border border-gray-200/80 rounded-[0.4vw] p-[0.45vw] flex items-center gap-[0.35vw]">
              <div className="w-[1.4vw] h-[1.4vw] rounded-[0.35vw] bg-amber-100/60 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Video size="0.8vw" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[0.72vw] font-semibold text-gray-900 leading-tight">Videos</span>
                <span className="text-[0.62vw] text-gray-500 font-medium truncate">YouTube, ...</span>
              </div>
            </div>
          </div>

          {/* Bottom Note Banner */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-[0.4vw] p-[0.45vw] px-[0.6vw] flex items-center gap-[0.4vw]">
            <Icon icon="lucide:info" className="w-[0.8vw] h-[0.8vw] text-blue-500 flex-shrink-0" />
            <p className="text-[0.72vw] text-gray-600 font-normal leading-tight">
              <strong className="font-semibold text-blue-700">Note:</strong> Use direct, publicly accessible links for best results.
            </p>
          </div>
        </div>
      </div>

      {/* Import Via URL Modal */}
      <ImportViaUrlModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        activePageIndex={activePageIndex}
      />

      {/* Media Gallery Popup */}
      <MediaGalleryPopup
        isOpen={isMediaGalleryOpen}
        onClose={() => setIsMediaGalleryOpen(false)}
        anchorRef={browseGalleryBtnRef}
        onFileSelect={(file) => {
          handleFileChange({ target: { files: [file] } });
          setIsMediaGalleryOpen(false);
        }}
      />
    </>
  );
};

export default UploadProperties;

