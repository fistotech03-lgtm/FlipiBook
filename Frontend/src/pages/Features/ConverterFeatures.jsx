import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

// Asset imports
import heroBg from '../../assets/Features/Converter/converter.webp';
import imgMock from '../../assets/Features/Converter/img.webp';
import imgBgLeaves from '../../assets/Features/Converter/imgbg.webp';
import vdoMock from '../../assets/Features/Converter/vdo.webp';
import vdoBgReel from '../../assets/Features/Converter/vdobg.webp';
import threeDMock from '../../assets/Features/Converter/3d.webp';
import threeDBgGeom from '../../assets/Features/Converter/3dbg.webp';

export default function ConverterFeatures() {
  const navigate = useNavigate();

  const handleStartConverting = () => {
    navigate('/converter');
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden">
      <main className="w-full flex-1">
        {/* =========================================
            SECTION 1: HERO (Converter & Compress)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop + rock 3D illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center opacity-25 md:opacity-100">
              <img
                src={heroBg}
                alt="FlipiBook Converter Preview"
                className="w-full h-full object-contain object-right"
              />
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 w-full max-w-[94vw] mx-auto px-4 sm:px-6 md:px-[3vw] pt-3 pb-4 md:py-[1.8vw]">
              {/* Back to Features Button */}
              <div className="mb-2.5 md:mb-3 ml-0 md:ml-[-4vw] mt-0 md:mt-[-0.8vw]">
                <button
                  type="button"
                  onClick={() => navigate('/features')}
                  className="inline-flex items-center gap-1.5 md:gap-[0.5vw] px-3 md:px-3.5 py-1.5 rounded-sm border border-gray-200 bg-white/90 text-gray-600 text-xs sm:text-sm md:text-[0.9vw] font-semibold shadow-xs transition-all cursor-pointer backdrop-blur-xs hover:bg-white"
                >
                  <Icon icon="lucide:arrow-left" className="w-3.5 h-3.5 md:w-[1vw] md:h-[1vw] text-gray-600" />
                  <span>Back to Features</span>
                </button>
              </div>

              <div className="w-full max-w-full md:max-w-[44vw] lg:max-w-[40vw]">
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-2 md:mb-[0.8vw]">
                  <span className="text-[11px] sm:text-xs md:text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    CONVERTER
                  </span>
                  <span className="w-8 md:w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.12]">
                  Convert &amp; Compress <br className="hidden sm:inline" />
                  <span className="text-[#EA580C]">Your Media</span>
                </h1>

                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.86vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Convert and compress images, videos, and 3D models with easy-to-use tools and optimized output quality.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-[0.6vw] mt-3.5 md:mt-[1.4vw]">
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Fast Conversion
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    High Quality Output
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Secure &amp; Private
                  </span>
                </div>
              </div>
            </div>
          </div>

        </section>

        <section className="relative w-full pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-12 md:pb-14 text-center bg-white">
          <div className="max-w-[960px] mx-auto px-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
              <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#111827] tracking-tight">
                 Smaller File Sizes. Faster Catalogue Loading
                 </h2>
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
            </div>
            <p className="text-xs sm:text-sm md:text-[14px] text-[#64748B] mt-2 max-w-2xl mx-auto leading-relaxed">
               Seamlessly convert and shrink heavy PDFs, high-res visuals, and 3D models into lightweight, fast-loading interactive catalogue.
               </p>
          </div>
        </section>

        {/* =========================================
            SECTION 2: IMAGE CONVERTER & COMPRESSOR
        ========================================= */}
        <section className="relative w-full py-8 md:py-[1.5vw] overflow-hidden bg-[#FBF9F7] border-t border-[#F1F5F9]/80">
          {/* Subtle floral background element */}
          <div className="hidden md:block absolute right-0 top-[17vw] -translate-y-1/2 pointer-events-none select-none z-0 max-w-[25vw] opacity-70">
            <img src={imgBgLeaves} alt="" className="w-full h-auto object-contain" />
          </div>

          <div className="relative z-10 max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-[2.5vw] items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-1.5 md:mb-[0.6vw]">
                  <span className="text-xs md:text-[0.85vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    IMAGE CONVERTER
                  </span>
                  <span className="w-8 md:w-[2.2vw] h-[2px] bg-[#EA580C]"></span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  Image Converter <br className="hidden sm:inline" />
                  &amp; Compressor
                </h2>
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.95vw] text-[#64748B] leading-relaxed">
                  Convert, compress and optimize your images for crystal-clear quality and smaller file sizes.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-4 md:mt-[1.8vw] space-y-3.5 md:space-y-[1.2vw]">
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:arrow-left-right" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Multi-Format Conversion &amp; Compression
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5">
                        Convert your images into WEBP, PNG and JPG formats.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:bar-chart-2" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Background Removal
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5">
                        Remove unwanted backgrounds with a simple toggle.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:download" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Easy File Download
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5">
                        Convert and download optimized images in one click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: UI Mockup Showcase (70%) */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end mt-4 lg:mt-0">
                <div className="relative w-full rounded-xl md:rounded-[1vw] bg-white p-3 md:p-[0.9vw] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <img
                    src={imgMock}
                    alt="Image Converter & Compressor Interface"
                    className="w-full h-auto rounded-lg md:rounded-[0.6vw] object-contain shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 3: VIDEO CONVERTER & COMPRESSOR
        ========================================= */}
        <section className="relative w-full py-8 md:py-[1.5vw] overflow-hidden bg-[#F8FAFC]">
          {/* Subtle film reel background element */}
          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 max-w-[16vw] opacity-70">
            <img src={vdoBgReel} alt="" className="w-full h-auto object-contain" />
          </div>

          <div className="relative z-10 max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="flex flex-col-reverse lg:grid lg:grid-cols-10 gap-6 lg:gap-[2.5vw] items-center">
              {/* Left Column: UI Mockup Showcase (70%) */}
              <div className="w-full lg:col-span-6 flex justify-center lg:justify-start mt-4 lg:mt-0">
                <div className="relative w-full rounded-xl md:rounded-[1vw] bg-white p-3 md:p-[0.9vw] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <img
                    src={vdoMock}
                    alt="Video Converter & Compressor Interface"
                    className="w-full h-auto rounded-lg md:rounded-[0.6vw] object-contain shadow-sm"
                  />
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="w-full lg:col-span-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-1.5 md:mb-[0.6vw]">
                  <span className="text-xs md:text-[0.85vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    VIDEO CONVERTER
                  </span>
                  <span className="w-8 md:w-[2.2vw] h-[2px] bg-[#CBD5E1]"></span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  Video Converter <br className="hidden sm:inline" />
                  &amp; Compressor
                </h2>
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.95vw] text-[#64748B] leading-relaxed">
                  Optimize your videos with flexible format and resolution options for smoother playback and faster loading.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-4 md:mt-[1.8vw] space-y-3.5 md:space-y-[1.2vw]">
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:arrow-left-right" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Multiple Formats Conversion &amp; Compression
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5">
                        Convert your videos into MP4 and WEBM formats.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:bar-chart-2" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Resolution Settings
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5">
                        Choose from 1080p, 720p and 480p resolutions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:download" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Easy Download
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5">
                        Convert and download optimized videos in one click.
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
        <section className="relative w-full py-8 md:py-[1.5vw] overflow-hidden bg-[#FBF9F7] border-t border-[#F1F5F9]/80 ">
          {/* Geometric 3D wireframe background element */}
          <div className="hidden md:block absolute right-0 bottom-0 pointer-events-none select-none z-0 max-w-[28vw] opacity-75">
            <img src={threeDBgGeom} alt="" className="w-full h-auto object-contain" />
          </div>

          <div className="relative z-10 max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-[2.5vw] items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-1.5 md:mb-[0.6vw]">
                  <span className="text-xs md:text-[0.85vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    3D MODEL CONVERTER
                  </span>
                  <span className="w-8 md:w-[2.2vw] h-[2px] bg-[#EA580C]"></span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  3D Model Converter <br className="hidden sm:inline" />
                  &amp; Compressor
                </h2>
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.95vw] text-[#64748B] leading-relaxed">
                  Convert and optimize your 3D models for faster loading, efficient storage and seamless interactive experiences.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-4 md:mt-[1.8vw] space-y-3.5 md:space-y-[1.2vw]">
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:box" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Multi-Format Conversion &amp; Compression
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5">
                        Convert your images into WEBP, PNG and JPG formats.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:refresh-cw" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        360 Degree Preview
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5">
                        Preview and rotate your 3D models before converting.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:download" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Easy Model Conversion
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5">
                        Convert and download optimized 3D models in one click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: UI Mockup Showcase (70%) */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end mt-4 lg:mt-0">
                <div className="relative w-full rounded-xl md:rounded-[1vw] bg-white p-3 md:p-[0.9vw] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <img
                    src={threeDMock}
                    alt="3D Model Converter & Compressor Interface"
                    className="w-full h-auto rounded-lg md:rounded-[0.6vw] object-contain shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 5: BOTTOM CALL TO ACTION (CTA)
        ========================================= */}
        <section className="relative w-full py-8 sm:py-10 md:py-[3vw] bg-white border-t border-[#F1F5F9]">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-[2vw]">
              <div className="w-full md:max-w-[44vw]">
                <span className="text-xs md:text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase block mb-1.5 md:mb-[0.6vw]">
                  READY TO CONVERT?
                </span>
                <h3 className="text-xl sm:text-2xl md:text-[2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.18]">
                  Make Your Media Lighter. <br className="hidden sm:inline" />
                  Make Your <span className="text-[#EA580C]">Experience Better.</span>
                </h3>
                <p className="mt-2 md:mt-[0.8vw] text-xs sm:text-sm md:text-[0.82vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Optimize images, videos, and 3D models for faster loading, efficient storage, and high-quality digital experiences.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={handleStartConverting}
                  className="inline-flex items-center gap-2 md:gap-[0.7vw] px-5 py-2.5 md:px-[1.5vw] md:py-[0.6vw] rounded-full bg-black hover:bg-[#111827] text-white text-xs sm:text-sm md:text-[0.82vw] font-medium tracking-wide transition-all shadow-sm hover:shadow group cursor-pointer"
                >
                  <span>Start Converting Now</span>
                  <span className="w-5 h-5 md:w-[1.4vw] md:h-[1.4vw] rounded-full bg-white text-black flex items-center justify-center shrink-0">
                    <Icon
                      icon="lucide:arrow-up-right"
                      className="w-3 h-3 md:w-[0.8vw] md:h-[0.8vw] stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

