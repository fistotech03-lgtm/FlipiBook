import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from './Footer';

// Asset imports
import heroBg from '../assets/Features/Feature.webp';
import imgMock from '../assets/Features/img.webp';
import imgBgLeaves from '../assets/Features/imgbg.webp';
import vdoMock from '../assets/Features/vdo.webp';
import vdoBgReel from '../assets/Features/vdobg.webp';
import threeDMock from '../assets/Features/3d.webp';
import threeDBgGeom from '../assets/Features/3dbg.webp';

export default function Features() {
  const navigate = useNavigate();

  const imageSectionRef = useRef(null);
  const videoSectionRef = useRef(null);
  const threeDSectionRef = useRef(null);

  const handleStartConverting = () => {
    navigate('/converter');
  };

  const handleScrollToSection = (type) => {
    const refs = {
      image: imageSectionRef,
      video: videoSectionRef,
      '3d': threeDSectionRef,
    };
    const targetRef = refs[type];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden">
      <main className="w-full flex-1">
        {/* =========================================
            SECTION 1: HERO (Converter & Compress)
        ========================================= */}
        <section className="relative w-full overflow-hidden">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[1920px] mx-auto min-h-[200px] sm:min-h-[580px] lg:min-h-[680px] flex items-center">
            {/* The laptop + rock 3D illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center">
              <img
                src={heroBg}
                alt="FlipiBook Converter Preview"
                className="w-full h-full object-contain object-right-top max-h-[720px]"
              />
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 py-8">
              <div className="max-w-[540px] pb-[10vw] lg:max-w-[580px]">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#94A3B8] uppercase">
                    CONVERTER
                  </span>
                  <span className="w-10 h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-[#111827] leading-[1.12]">
                  Convert &amp; Compress <br />
                  <span className="text-[#EA580C]">Your Media</span>
                </h1>

                <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-[480px]">
                  Convert and compress images, videos, and 3D models with easy-to-use tools and optimized output quality.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 sm:mt-8">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#E2E8F0] shadow-sm text-xs sm:text-[13px] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 text-[#EA580C]" />
                    Fast Conversion
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#E2E8F0] shadow-sm text-xs sm:text-[13px] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-3.5 h-3.5 text-[#EA580C]" />
                    High Quality Output
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#E2E8F0] shadow-sm text-xs sm:text-[13px] font-medium text-[#475569]">
                    <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-[#EA580C]" />
                    Secure &amp; Private
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Converter Card Container */}
          <div className="relative z-10 max-w-[70vw] mx-auto mt-[-12vw]">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl lg:rounded-[1.6vw] border border-[#F1F5F9] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] p-5 sm:p-8 lg:p-[2vw]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-[1.5vw] items-contain">
                  {/* Card 1: Image */}
                  <div
                    onClick={() => handleScrollToSection('image')}
                    className="bg-[#FAFBFC] hover:bg-white rounded-2xl lg:rounded-[1.2vw] border border-gray-200/80 hover:border-gray-300 transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 lg:p-[1.4vw] shadow-xs hover:shadow-md relative overflow-hidden group cursor-pointer text-left"
                  >
                    {/* Top Subtle Gradient Light */}
                    <div className="absolute top-0 left-0 right-0 h-28 lg:h-[7vw] bg-gradient-to-b from-gray-700/5 via-gray-500/5 to-transparent pointer-events-none transition-opacity" />

                    {/* Card Top Area */}
                    <div>
                      {/* Drop / Select Canvas Box */}
                      <div className="w-full h-48 sm:h-52 lg:h-[13vw] rounded-2xl lg:rounded-[1vw] border-2 border-dashed border-gray-200 bg-white group-hover:border-[#ea543a] flex flex-col items-center justify-center p-3 sm:p-4 lg:p-[1vw] transition-all duration-200 relative overflow-hidden">
                        {/* Badge Icon */}
                        <div className="absolute top-2.5 sm:top-3 lg:top-[0.8vw] left-2.5 sm:left-3 lg:left-[0.8vw] p-1.5 lg:p-[0.4vw] rounded-lg lg:rounded-[0.5vw] border shadow-2xs text-gray-700 bg-gray-100 border-gray-200">
                          <Icon icon="heroicons:photo-solid" className="w-3.5 h-3.5 lg:w-[1vw] lg:h-[1vw]" />
                        </div>

                        {/* Max Size Indicator */}
                        <div className="absolute top-2.5 sm:top-3 lg:top-[0.8vw] right-2.5 sm:right-3 lg:right-[0.8vw] text-[10px] lg:text-[0.65vw] font-medium text-gray-500 bg-white px-2 lg:px-[0.5vw] py-0.5 lg:py-[0.15vw] rounded-md lg:rounded-[0.35vw] border border-gray-200">
                          Max 25 MB
                        </div>

                        {/* Empty State Prompt */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-[3.6vw] lg:h-[3.6vw] rounded-2xl lg:rounded-[0.9vw] bg-white border border-gray-200/80 shadow-xs flex items-center justify-center mb-2.5 lg:mb-[0.7vw] text-gray-800 group-hover:scale-110 group-hover:text-[#ea543a] group-hover:border-[#ea543a]/40 transition-all duration-300">
                            <Icon icon="solar:gallery-bold-duotone" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-[2vw] lg:h-[2vw]" />
                          </div>
                          <p className="text-xs sm:text-sm lg:text-[0.85vw] font-medium text-gray-800 mb-0.5">
                            Drop Image here
                          </p>
                          <p className="text-[11px] sm:text-xs lg:text-[0.7vw] text-gray-400 font-normal">or click to browse</p>
                          <div className="mt-2 sm:mt-2.5 lg:mt-[0.6vw] px-2 sm:px-2.5 lg:px-[0.6vw] py-1 lg:py-[0.25vw] rounded-md lg:rounded-[0.4vw] bg-white border border-gray-300 shadow-2xs">
                            <p className="text-[10px] sm:text-[11px] lg:text-[0.65vw] font-semibold text-gray-700 tracking-wide uppercase">
                              PNG, JPG, WEBP
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <div className="text-center mt-5 lg:mt-[1.3vw] mb-0">
                        <h2 className="text-base sm:text-lg lg:text-[1.1vw] font-semibold text-gray-900 tracking-tight">
                          Image
                        </h2>
                        <p className="text-xs lg:text-[0.75vw] text-gray-500 mt-1 lg:mt-[0.3vw] leading-relaxed px-1 font-normal">
                          Convert or compress images.
                        </p>
                      </div>
                    </div>

                    {/* Bottom Trigger Action Button */}
                    <div className="mt-5 lg:mt-[1.3vw] pt-2 lg:pt-[0.6vw] flex flex-col gap-2 lg:gap-[0.5vw]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScrollToSection('image');
                        }}
                        className="w-full py-2.5 sm:py-3 lg:py-[0.7vw] px-4 lg:px-[1vw] rounded-xl lg:rounded-[0.7vw] text-white font-medium text-xs sm:text-sm lg:text-[0.8vw] shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 lg:gap-[0.5vw] cursor-pointer bg-[#1e232d] group-hover:bg-[#ea543a]"
                      >
                        <span>Choose Image File</span>
                        <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[1vw] lg:h-[1vw]" />
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Video */}
                  <div
                    onClick={() => handleScrollToSection('video')}
                    className="bg-[#FAFBFC] hover:bg-white rounded-2xl lg:rounded-[1.2vw] border border-gray-200/80 hover:border-gray-300 transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 lg:p-[1.4vw] shadow-xs hover:shadow-md relative overflow-hidden group cursor-pointer text-left"
                  >
                    {/* Top Subtle Gradient Light */}
                    <div className="absolute top-0 left-0 right-0 h-28 lg:h-[7vw] bg-gradient-to-b from-gray-700/5 via-gray-500/5 to-transparent pointer-events-none transition-opacity" />

                    {/* Card Top Area */}
                    <div>
                      {/* Drop / Select Canvas Box */}
                      <div className="w-full h-48 sm:h-52 lg:h-[13vw] rounded-2xl lg:rounded-[1vw] border-2 border-dashed border-gray-200 bg-white group-hover:border-[#ea543a] flex flex-col items-center justify-center p-3 sm:p-4 lg:p-[1vw] transition-all duration-200 relative overflow-hidden">
                        {/* Badge Icon */}
                        <div className="absolute top-2.5 sm:top-3 lg:top-[0.8vw] left-2.5 sm:left-3 lg:left-[0.8vw] p-1.5 lg:p-[0.4vw] rounded-lg lg:rounded-[0.5vw] border shadow-2xs text-gray-700 bg-gray-100 border-gray-200">
                          <Icon icon="heroicons:video-camera-solid" className="w-3.5 h-3.5 lg:w-[1vw] lg:h-[1vw]" />
                        </div>

                        {/* Max Size Indicator */}
                        <div className="absolute top-2.5 sm:top-3 lg:top-[0.8vw] right-2.5 sm:right-3 lg:right-[0.8vw] text-[10px] lg:text-[0.65vw] font-medium text-gray-500 bg-white px-2 lg:px-[0.5vw] py-0.5 lg:py-[0.15vw] rounded-md lg:rounded-[0.35vw] border border-gray-200">
                          Max 100 MB
                        </div>

                        {/* Empty State Prompt */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-[3.6vw] lg:h-[3.6vw] rounded-2xl lg:rounded-[0.9vw] bg-white border border-gray-200/80 shadow-xs flex items-center justify-center mb-2.5 lg:mb-[0.7vw] text-gray-800 group-hover:scale-110 group-hover:text-[#ea543a] group-hover:border-[#ea543a]/40 transition-all duration-300">
                            <Icon icon="solar:videocamera-record-bold-duotone" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-[2vw] lg:h-[2vw]" />
                          </div>
                          <p className="text-xs sm:text-sm lg:text-[0.85vw] font-medium text-gray-800 mb-0.5">
                            Drop Video here
                          </p>
                          <p className="text-[11px] sm:text-xs lg:text-[0.7vw] text-gray-400 font-normal">or click to browse</p>
                          <div className="mt-2 sm:mt-2.5 lg:mt-[0.6vw] px-2 sm:px-2.5 lg:px-[0.6vw] py-1 lg:py-[0.25vw] rounded-md lg:rounded-[0.4vw] bg-white border border-gray-300 shadow-2xs">
                            <p className="text-[10px] sm:text-[11px] lg:text-[0.65vw] font-semibold text-gray-700 tracking-wide uppercase">
                              MP4, WEBM, MOV, AVI, MKV
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <div className="text-center mt-5 lg:mt-[1.3vw] mb-0">
                        <h2 className="text-base sm:text-lg lg:text-[1.1vw] font-semibold text-gray-900 tracking-tight">
                          Video
                        </h2>
                        <p className="text-xs lg:text-[0.75vw] text-gray-500 mt-1 lg:mt-[0.3vw] leading-relaxed px-1 font-normal">
                          Convert or compress videos.
                        </p>
                      </div>
                    </div>

                    {/* Bottom Trigger Action Button */}
                    <div className="mt-5 lg:mt-[1.3vw] pt-2 lg:pt-[0.6vw] flex flex-col gap-2 lg:gap-[0.5vw]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScrollToSection('video');
                        }}
                        className="w-full py-2.5 sm:py-3 lg:py-[0.7vw] px-4 lg:px-[1vw] rounded-xl lg:rounded-[0.7vw] text-white font-medium text-xs sm:text-sm lg:text-[0.8vw] shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 lg:gap-[0.5vw] cursor-pointer bg-[#1e232d] group-hover:bg-[#ea543a]"
                      >
                        <span>Choose Video File</span>
                        <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[1vw] lg:h-[1vw]" />
                      </button>
                    </div>
                  </div>

                  {/* Card 3: 3D Model */}
                  <div
                    onClick={() => handleScrollToSection('3d')}
                    className="bg-[#FAFBFC] hover:bg-white rounded-2xl lg:rounded-[1.2vw] border border-gray-200/80 hover:border-gray-300 transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 lg:p-[1.4vw] shadow-xs hover:shadow-md relative overflow-hidden group cursor-pointer text-left"
                  >
                    {/* Top Subtle Gradient Light */}
                    <div className="absolute top-0 left-0 right-0 h-28 lg:h-[7vw] bg-gradient-to-b from-gray-700/5 via-gray-500/5 to-transparent pointer-events-none transition-opacity" />

                    {/* Card Top Area */}
                    <div>
                      {/* Drop / Select Canvas Box */}
                      <div className="w-full h-48 sm:h-52 lg:h-[13vw] rounded-2xl lg:rounded-[1vw] border-2 border-dashed border-gray-200 bg-white group-hover:border-[#ea543a] flex flex-col items-center justify-center p-3 sm:p-4 lg:p-[1vw] transition-all duration-200 relative overflow-hidden">
                        {/* Badge Icon */}
                        <div className="absolute top-2.5 sm:top-3 lg:top-[0.8vw] left-2.5 sm:left-3 lg:left-[0.8vw] p-1.5 lg:p-[0.4vw] rounded-lg lg:rounded-[0.5vw] border shadow-2xs text-gray-700 bg-gray-100 border-gray-200">
                          <Icon icon="heroicons:cube-solid" className="w-3.5 h-3.5 lg:w-[1vw] lg:h-[1vw]" />
                        </div>

                        {/* Max Size Indicator */}
                        <div className="absolute top-2.5 sm:top-3 lg:top-[0.8vw] right-2.5 sm:right-3 lg:right-[0.8vw] text-[10px] lg:text-[0.65vw] font-medium text-gray-500 bg-white px-2 lg:px-[0.5vw] py-0.5 lg:py-[0.15vw] rounded-md lg:rounded-[0.35vw] border border-gray-200">
                          Max 60 MB
                        </div>

                        {/* Empty State Prompt */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-[3.6vw] lg:h-[3.6vw] rounded-2xl lg:rounded-[0.9vw] bg-white border border-gray-200/80 shadow-xs flex items-center justify-center mb-2.5 lg:mb-[0.7vw] text-gray-800 group-hover:scale-110 group-hover:text-[#ea543a] group-hover:border-[#ea543a]/40 transition-all duration-300">
                            <Icon icon="solar:box-bold-duotone" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-[2vw] lg:h-[2vw]" />
                          </div>
                          <p className="text-xs sm:text-sm lg:text-[0.85vw] font-medium text-gray-800 mb-0.5">
                            Drop 3D Model here
                          </p>
                          <p className="text-[11px] sm:text-xs lg:text-[0.7vw] text-gray-400 font-normal">or click to browse</p>
                          <div className="mt-2 sm:mt-2.5 lg:mt-[0.6vw] px-2 sm:px-2.5 lg:px-[0.6vw] py-1 lg:py-[0.25vw] rounded-md lg:rounded-[0.4vw] bg-white border border-gray-300 shadow-2xs">
                            <p className="text-[10px] sm:text-[11px] lg:text-[0.65vw] font-semibold text-gray-700 tracking-wide uppercase">
                              GLB, GLTF, FBX, OBJ, STL, ZIP
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <div className="text-center mt-5 lg:mt-[1.3vw] mb-0">
                        <h2 className="text-base sm:text-lg lg:text-[1.1vw] font-semibold text-gray-900 tracking-tight">
                          3D Model
                        </h2>
                        <p className="text-xs lg:text-[0.75vw] text-gray-500 mt-1 lg:mt-[0.3vw] leading-relaxed px-1 font-normal">
                          Convert or compress 3D models.
                        </p>
                      </div>
                    </div>

                    {/* Bottom Trigger Action Button */}
                    <div className="mt-5 lg:mt-[1.3vw] pt-2 lg:pt-[0.6vw] flex flex-col gap-2 lg:gap-[0.5vw]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScrollToSection('3d');
                        }}
                        className="w-full py-2.5 lg:py-[0.6vw] px-3 lg:px-[0.8vw] rounded-xl lg:rounded-[0.7vw] text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 font-medium text-xs sm:text-sm lg:text-[0.8vw] border border-slate-200/80 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 lg:gap-[0.4vw] cursor-pointer"
                      >
                        <Icon icon="lucide:folder-up" className="w-3.5 h-3.5 lg:w-[0.9vw] lg:h-[0.9vw] text-slate-500" />
                        <span>Upload 3D Model Folder</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScrollToSection('3d');
                        }}
                        className="w-full py-2.5 sm:py-3 lg:py-[0.7vw] px-4 lg:px-[1vw] rounded-xl lg:rounded-[0.7vw] text-white font-medium text-xs sm:text-sm lg:text-[0.8vw] shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 lg:gap-[0.5vw] cursor-pointer bg-[#1e232d] group-hover:bg-[#ea543a]"
                      >
                        <span>Choose 3D Model File / Zip</span>
                        <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[1vw] lg:h-[1vw]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

        {/* =========================================
            SECTION 2: IMAGE CONVERTER & COMPRESSOR
        ========================================= */}
        <section ref={imageSectionRef} className="relative w-full py-16 sm:py-24 overflow-hidden bg-[#FBF9F7] border-t border-[#F1F5F9]/80 scroll-mt-6">
          {/* Subtle floral background element */}
          <div className="absolute right-0 top-[50%] -translate-y-1/2 pointer-events-none select-none z-0 max-w-[360px] opacity-70">
            <img src={imgBgLeaves} alt="" className="w-full h-auto object-contain" />
          </div>

          <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#94A3B8] uppercase block mb-2 sm:mb-3">
                  IMAGE CONVERTER
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111827] leading-[1.2]">
                  Image Converter <br />
                  <span className="text-[#EA580C]">&amp; Compressor</span>
                </h2>
                <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
                  Convert, compress, and optimize your images for maximum visual quality and small file sizes.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:shuffle" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Multi-Format Conversion
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Convert your images to WEBP, PNG, and JPEG formats with one click.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:minimize-2" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Smart Image Compression
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Reduce image file sizes with flexible compression options.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:sliders" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Image Resolution Details
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Keep original aspect ratios or scale resolutions dynamically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:sparkles" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Background Removal
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Remove unwanted backgrounds instantly with an automatic toggle.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:download-cloud" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Easy File Conversion
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Convert and download optimized assets ready for instant publication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: UI Mockup Showcase */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[620px] rounded-2xl bg-white p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <img
                    src={imgMock}
                    alt="Image Converter & Compressor Interface"
                    className="w-full h-auto rounded-xl object-contain shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 3: VIDEO CONVERTER & COMPRESSOR
        ========================================= */}
        <section ref={videoSectionRef} className="relative w-full py-16 sm:py-24 overflow-hidden bg-[#F8FAFC] scroll-mt-6">
          {/* Subtle film reel background element */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 max-w-[280px] opacity-70">
            <img src={vdoBgReel} alt="" className="w-full h-auto object-contain" />
          </div>

          <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: UI Mockup Showcase */}
              <div className="order-2 lg:order-1 lg:col-span-6 flex justify-center lg:justify-start">
                <div className="relative w-full max-w-[620px] rounded-2xl bg-white p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <img
                    src={vdoMock}
                    alt="Video Converter & Compressor Interface"
                    className="w-full h-auto rounded-xl object-contain shadow-sm"
                  />
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col justify-center">
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#94A3B8] uppercase block mb-2 sm:mb-3">
                  VIDEO CONVERTER
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111827] leading-[1.2]">
                  Video Converter <br />
                  <span className="text-[#EA580C]">&amp; Compressor</span>
                </h2>
                <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
                  Optimize your videos with flexible format and resolution options to ensure seamless and fast loading.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:arrow-left-right" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Multiple Formats
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Convert your video into MP4 and WEBM formats with high fidelity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:bar-chart-2" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Smart Compression
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Reduce video file sizes with flexible bitrate compression options.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:layers" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Resolution Settings
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Choose from 1080p, 720p, or 480p resolution presets effortlessly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:play-circle" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Video Preview
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Preview your videos between conversions to verify output quality.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:check-circle" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Easy Conversion
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Convert and compress or optimize videos in one click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 4: 3D MODEL CONVERTER & COMPRESSOR
        ========================================= */}
        <section ref={threeDSectionRef} className="relative w-full py-16 sm:py-24 overflow-hidden bg-[#FBF9F7] border-t border-[#F1F5F9]/80 scroll-mt-6">
          {/* Geometric 3D wireframe background element */}
          <div className="absolute right-0 bottom-0 pointer-events-none select-none z-0 max-w-[480px] opacity-75">
            <img src={threeDBgGeom} alt="" className="w-full h-auto object-contain" />
          </div>

          <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#94A3B8] uppercase block mb-2 sm:mb-3">
                  3D MODEL CONVERTER
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111827] leading-[1.2]">
                  3D Model Converter <br />
                  <span className="text-[#EA580C]">&amp; Compressor</span>
                </h2>
                <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
                  Convert and optimize your 3D models for faster loading, efficient storage, and seamless interactive experience.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:box" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Multi-Format Conversion
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Convert your 3D models into GLB, GLTF, and OBJ formats seamlessly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:compress" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Smart Compression
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Optimize your 3D models with Draco texture and mesh compression.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:cpu" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Polygon Optimization
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Reduce polygon counts to improve model loading performance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:eye" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        3D Model Preview
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Inspect and rotate your 3D models in 360° before converting.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:download" className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">
                        Easy Model Conversion
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                        Convert and download optimized 3D models in seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: UI Mockup Showcase */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[620px] rounded-2xl bg-white p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <img
                    src={threeDMock}
                    alt="3D Model Converter & Compressor Interface"
                    className="w-full h-auto rounded-xl object-contain shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 5: BOTTOM CALL TO ACTION (CTA)
        ========================================= */}
        <section className="relative w-full py-16 sm:py-20 bg-white border-t border-[#F1F5F9]">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
              <div className="max-w-2xl">
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#94A3B8] uppercase block mb-3 sm:mb-4">
                  READY TO CONVERT?
                </span>
                <h3 className="text-2xl sm:text-4xl lg:text-[35px] font-semibold tracking-tight text-[#111827] leading-[1.18]">
                  Make Your Media Lighter. <br />
                  Make Your <span className="text-[#EA580C]">Experience Better.</span>
                </h3>
                <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
                  Optimize images, videos, and 3D models for faster loading, efficient storage, and high-quality digital experiences.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={handleStartConverting}
                  className="inline-flex items-center gap-3.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-black hover:bg-[#111827] text-white text-xs sm:text-sm font-medium tracking-wide transition-all shadow-sm hover:shadow group cursor-pointer"
                >
                  <span>Start Converting Now</span>
                  <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                    <Icon
                      icon="lucide:arrow-up-right"
                      className="w-3.5 h-3.5 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================
          GLOBAL FOOTER
      ========================================= */}
      <Footer />
    </div>
  );
}
