import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import {
  ShieldCheck,
  Zap,
  Globe,
  Gem,
  AlertCircle,
  Leaf,
  Scaling,
  UploadCloud,
  SlidersHorizontal,
  Download,
  Info
} from 'lucide-react';
import Footer from './Footer';
import ConverterWorkspace from './Converter/ConverterWorkspace';
import { preloadBackgroundRemovalModel } from './Converter/backgroundRemovalService';
import { extractFilesFromDataTransfer, packageFilesToZip, findPrimary3DModel } from './Converter/archiveModelHandler';
import convertImageImg from '../assets/Features/Converter/convert-image.webp';
import convertVideoImg from '../assets/Features/Converter/convert-video.webp';
import convert3dImg from '../assets/Features/Converter/convert-3d.webp';
import howToConvertImg from '../assets/Features/Converter/how-to-convert.webp';

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
    title: 'Convert Image',
    tagline: 'Convert or compress images to web-optimized formats.',
    buttonLabel: 'Upload Image File',
    formats: ['WEBP', 'PNG', 'JPG'],
    formatPills: ['PNG', 'JPG', 'WEBP'],
    accept: 'image/png,image/jpeg,image/webp',
    defaultOutput: 'WEBP',
    compressionLevels: ['Original Quality (Format Only)', 'High Quality (85%)', 'Balanced (70%)', 'Low Quality (50%)'],
    maxSize: MAX_FILE_SIZES.image
  },
  {
    id: 'video',
    title: 'Convert Video',
    tagline: 'Convert or compress videos for smooth playback.',
    buttonLabel: 'Upload Video File',
    formats: ['MP4', 'WEBM'],
    formatPills: ['MP4', 'MOV', 'WEBM', 'AVI', 'MKV'],
    accept: 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska',
    defaultOutput: 'MP4',
    compressionLevels: ['Original Resolution & Quality (Format Only)', '1080p Web-Optimized', '720p HD Compact', '480p Mobile Saver'],
    maxSize: MAX_FILE_SIZES.video
  },
  {
    id: 'threed',
    title: 'Convert 3D Model',
    tagline: 'Convert or compress 3D models for interactive viewing.',
    buttonLabel: 'Upload 3D Model File / Zip',
    formats: ['GLB', 'OBJ', 'FBX', 'USDZ'],
    formatPills: ['GLB', 'GLTF', 'FBX', 'OBJ', 'STL', 'ZIP'],
    accept: '.glb,.gltf,.obj,.fbx,.usdz,.stl,.zip,.rar,.7z,.tar,.gz',
    defaultOutput: 'GLB',
    compressionLevels: ['Original (Lossless)', 'Lossless (Optimized)', 'Draco + Meshopt (High)', 'Texture Only (70%)'],
    maxSize: MAX_FILE_SIZES.threed
  }
];

const CARD_ILLUSTRATIONS = {
  image: { src: convertImageImg, alt: 'Convert Image' },
  video: { src: convertVideoImg, alt: 'Convert Video' },
  threed: { src: convert3dImg, alt: 'Convert 3D Model' }
};

function MediaCardIllustration({ id }) {
  const asset = CARD_ILLUSTRATIONS[id] || CARD_ILLUSTRATIONS.threed;
  return (
    <img
      src={asset.src}
      alt={asset.alt}
      className="w-24 h-20 object-contain mx-auto select-none pointer-events-none"
    />
  );
}

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
    threed: useRef(null),
    threedFolder: useRef(null)
  };

  const formatBytes = (bytes = 0) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

const ALLOWED_EXTENSIONS = {
  image: ['png', 'jpg', 'jpeg', 'webp'],
  video: ['mp4', 'mov', 'webm', 'avi', 'mkv'],
  threed: ['glb', 'gltf', 'fbx', 'obj', 'stl', 'usdz', 'zip', 'rar', '7z', 'tar', 'gz']
};

  // Called when user selects or drops a single file, archive or folder
  const handleSelectFile = async (mediaId, fileList) => {
    const rawFiles = Array.from(fileList || []);
    if (!rawFiles.length) return;

    let file = rawFiles[0];

    // For 3D models: if multiple files or a folder were dropped/selected, package them into a virtual ZIP archive
    if (mediaId === 'threed' && rawFiles.length > 1) {
      const fileEntries = rawFiles.map((f) => ({
        file: f,
        path: f.webkitRelativePath || f.name
      }));
      const primary = findPrimary3DModel(fileEntries);
      const pkgName = primary ? `${primary.file.name.replace(/\.[^/.]+$/, '')}_bundle.zip` : 'model_package.zip';
      file = await packageFilesToZip(fileEntries, pkgName);
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ALLOWED_EXTENSIONS[mediaId];
    if (allowedExts && !allowedExts.includes(ext)) {
      const mediaLabel = mediaId === 'threed' ? '3D Model' : mediaId.charAt(0).toUpperCase() + mediaId.slice(1);
      setSizeWarning(
        `"${file.name}" is not a supported ${mediaLabel} file. Allowed formats: ${allowedExts.join(', ').toUpperCase()}.`
      );
      setTimeout(() => setSizeWarning(null), 5000);
      return;
    }

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

  // Dedicated handler for folder drops / drag-and-drop dataTransfer
  const handleDropMedia = async (mediaId, dataTransfer) => {
    if (mediaId === 'threed' && dataTransfer) {
      try {
        const fileEntries = await extractFilesFromDataTransfer(dataTransfer);
        if (fileEntries.length > 1) {
          const primary = findPrimary3DModel(fileEntries);
          const pkgName = primary ? `${primary.file.name.replace(/\.[^/.]+$/, '')}_bundle.zip` : 'model_package.zip';
          const zippedFile = await packageFilesToZip(fileEntries, pkgName);
          handleSelectFile(mediaId, [zippedFile]);
          return;
        } else if (fileEntries.length === 1) {
          handleSelectFile(mediaId, [fileEntries[0].file]);
          return;
        }
      } catch (err) {
        console.warn('Folder drop extraction fallback:', err);
      }
    }

    if (dataTransfer?.files?.length) {
      handleSelectFile(mediaId, dataTransfer.files);
    }
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
        onDropMedia={(dataTransfer) => handleDropMedia(activeWorkspaceMediaId, dataTransfer)}
      />
    );
  }

  // Converter Home Page
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-poppins select-none text-[#1e232d]">
      
      {/* Hidden File Inputs */}
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

      {/* Dedicated Folder Input for 3D Models */}
      <input
        ref={fileInputRefs.threedFolder}
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleSelectFile('threed', e.target.files);
          e.target.value = '';
        }}
      />

      {/* Main Header / Title Section */}
      <section className="w-full pt-10 sm:pt-14 pb-8 px-4 sm:px-6 text-center bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-bold text-[#2D3139] tracking-tight leading-tight mb-4">
            Convert &amp; Compress <span className="text-[#EC5137]">Your Media</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-600 max-w-xl leading-relaxed mb-7">
            Turn your images, videos, and 3D models into optimized, web-ready files for your interactive flipbooks.
          </p>

          {/* 4 Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              {
                label: 'Fast & Reliable',
                svg: <Icon icon="andrsrxn:lightning-fast" className="w-4 h-4" />
              },
              {
                label: 'High Quality Output',
                svg: (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 5h12l3 5-9 10L3 10l3-5z" />
                    <path d="M3 10h18M9 5l-1 5 4 10 4-10-1-5" />
                  </svg>
                )
              },
              {
                label: 'Optimized for Web',
                svg: (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M3.5 12h17M12 3.5a12 12 0 0 1 0 17M12 3.5a12 12 0 0 0 0 17" />
                  </svg>
                )
              },
              {
                label: 'Secure & Private',
                svg: (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3.5l7 3v5.5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6.5l7-3z" />
                    <path d="M9.5 12l2 2 3.5-3.5" />
                  </svg>
                )
              }
            ].map(({ svg, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#35363A]">
                <span className="w-7 h-7 rounded-full bg-[#EC5137] text-white flex items-center justify-center shrink-0">
                  {svg}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {sizeWarning && (
            <div className="fixed top-20 right-5 z-[9999] p-3.5 pr-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center gap-2.5 max-w-md text-left shadow-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span className="flex-1">{sizeWarning}</span>
              <button
                type="button"
                onClick={() => setSizeWarning(null)}
                className="text-amber-600 hover:text-amber-900 text-xs font-bold px-1 cursor-pointer"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3 Main Converter Cards Section */}
      <section className="w-full py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {MEDIA_CONVERTERS.map((media) => {
            const isDragging = dragOverMediaId === media.id;

            return (
              <div
                key={media.id}
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
                  handleDropMedia(media.id, e.dataTransfer);
                }}
                className={`bg-white rounded-[24px] transition-all duration-300 flex flex-col px-7 pb-7 pt-5 sm:px-8 sm:pb-8 sm:pt-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] relative overflow-hidden ${
                  isDragging
                    ? 'border-2 border-dashed border-[#EC5137] scale-[1.01]'
                    : 'border border-gray-100/80'
                }`}
              >
                {isDragging && (
                  <div className="absolute inset-0 z-20 bg-[#FFF5E6]/90 backdrop-blur-[2px] flex items-center justify-center pointer-events-none rounded-[22px]">
                    <p className="text-2xl sm:text-3xl font-semibold text-[#EC5137] text-center leading-snug">
                      Drop Your
                      <br />
                      File Here
                    </p>
                  </div>
                )}
                {/* Top-right MAX Size Badge */}
                <div className="flex justify-end mb-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[13px] font-medium text-[#525457]">
                    <Info className="w-4 h-4 text-[#EC5137]" />
                    <span>MAX : {media.maxSize.label}</span>
                  </div>
                </div>

                {/* Card Center Content */}
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="mb-5">
                    <MediaCardIllustration id={media.id} />
                  </div>

                  <h2 className="text-xl sm:text-[22px] font-bold text-[#2D3139] tracking-tight">
                    {media.title}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#525457] mt-2 leading-relaxed max-w-[240px]">
                    {media.tagline}
                  </p>

                  {/* Format Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
                    {media.formatPills.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2.5 py-1 rounded-md bg-white border border-gray-100 shadow-[0px_2px_4px_rgba(0,0,0,0.25)] text-xs font-medium text-[#525457] tracking-wide"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-auto pt-6 flex flex-col gap-2.5">
                  {media.id === 'threed' && (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.threedFolder?.current?.click()}
                      className="w-full py-3 px-4 rounded-xl text-[#8A8C90] hover:text-[#2D3139] bg-[#F2F2F2] hover:bg-gray-200 font-medium text-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Upload 3D Model Folder
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRefs[media.id]?.current?.click()}
                    className="w-full py-3 px-4 rounded-xl text-white font-medium text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer bg-[#555555] hover:bg-[#EC5137]"
                  >
                    {media.buttonLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dark Feature Highlights Banner */}
      <section className="w-full py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto bg-[#292929] rounded-3xl px-6 sm:px-10 py-10 sm:py-12 text-white shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {[
              {
                icon: 'material-symbols:photo-size-select-small',
                title: 'Smaller File Size',
                desc: 'Reduce the size of your media files while maintaining the visual quality needed for your digital content.'
              },
              {
                icon: 'evicons:fast-charging',
                title: 'Faster Loading',
                desc: 'Optimized media helps your flipbooks and digital content load faster and perform more smoothly.'
              },
              {
                icon: 'clarity:world-line',
                title: 'Web-Ready Media',
                desc: 'Prepare your images, videos, and 3D models for seamless use across supported web experiences.'
              },
              {
                icon: 'teenyicons:mongodb-outline',
                title: 'Flexible Conversion',
                desc: 'Choose from supported file formats and available optimization settings to suit your needs.'
              }
            ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`flex flex-col items-center text-center lg:px-6 ${
                    idx < 3 ? 'lg:border-r lg:border-white/15' : ''
                  }`}
                >
                  <Icon icon={item.icon} className="w-7 h-7 text-[#EC5137] mb-3.5" />
                  <h3 className="text-sm sm:text-base font-semibold text-[#FFFFFF] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs font-normal text-[#F3F3F3] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Convert - 3 Simple Steps Section */}
      <section className="w-full bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 mt-4">
        <div className="max-w-[1440px] mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-gray-600 uppercase">
              HOW TO CONVERT
            </span>
            <span className="w-12 h-px bg-gray-300" />
          </div>

          {/* Section Heading */}
          <h2 className="text-2xl sm:text-4xl font-bold text-[#2D3139] tracking-tight mb-10 sm:mb-12">
            Convert Your Files in <span className="text-[#EC5137]">3 Simple</span> Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            {/* Left Illustration */}
            <div className="flex justify-center">
              <img
                src={howToConvertImg}
                alt="Convert Your Files in 3 Simple Steps"
                className="w-full max-w-sm object-contain select-none pointer-events-none"
              />
            </div>

            {/* Right 3-Step Timeline */}
            <div className="relative flex flex-col justify-between h-full py-4 gap-8 md:gap-0">
              {/* Vertical connecting line */}
              <div className="absolute left-6 top-6 bottom-6 w-px bg-gray-200 pointer-events-none" />

              {[
                {
                  icon: 'ant-design:cloud-upload-outlined',
                  title: 'Upload Your File',
                  desc: 'Select an image, video, or 3D model from your device to get started.'
                },
                {
                  icon: 'streamline-plump:convert-pdf-1',
                  title: 'Customize & Convert',
                  desc: 'Choose your output format and adjust the available conversion settings.'
                },
                {
                  icon: 'akar-icons:download',
                  title: 'Preview & Download',
                  desc: "Review your converted file and download it when you're ready."
                }
              ].map((step) => (
                  <div key={step.title} className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FDF0ED] text-[#EC5137] flex items-center justify-center shrink-0 z-10 border border-[#FADBD4]">
                      <Icon icon={step.icon} className="w-6 h-6" />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-base font-bold text-[#2D3139]">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}
