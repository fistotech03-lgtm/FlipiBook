import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from './Footer';

// Asset imports
import heroBg from '../assets/Features/Feature.webp';
import converterCardMock from '../assets/Features/converter.webp';
import imgMock from '../assets/Features/img.webp';
import imgBgLeaves from '../assets/Features/imgbg.webp';
import vdoMock from '../assets/Features/vdo.webp';
import vdoBgReel from '../assets/Features/vdobg.webp';
import threeDMock from '../assets/Features/3d.webp';
import threeDBgGeom from '../assets/Features/3dbg.webp';

export default function Features() {
  const navigate = useNavigate();

  const handleStartConverting = () => {
    navigate('/converter');
  };

  const handleChooseFile = (type) => {
    navigate(`/converter?type=${type}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden">
      <main className="w-full flex-1">
        {/* =========================================
            SECTION 1: HERO (Converter & Compress)
        ========================================= */}
        <section className="relative w-full pt-8 sm:pt-12 md:pt-14 lg:pt-16 pb-12 sm:pb-20 overflow-hidden">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[1920px] mx-auto min-h-[480px] sm:min-h-[580px] lg:min-h-[680px] flex items-center">
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
              <div className="max-w-[540px] lg:max-w-[580px]">
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-[#E2E8F0] shadow-sm text-xs sm:text-[13px] font-medium text-[#475569]">
                    <Icon icon="lucide:zap" className="w-3.5 h-3.5 text-[#EA580C]" />
                    Fast Conversion
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-[#E2E8F0] shadow-sm text-xs sm:text-[13px] font-medium text-[#475569]">
                    <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-[#EA580C]" />
                    High Quality Output
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-[#E2E8F0] shadow-sm text-xs sm:text-[13px] font-medium text-[#475569]">
                    <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-[#EA580C]" />
                    Secure &amp; Private
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Container Image: converter.webp with interactive click zones */}
          <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 -mt-6 sm:-mt-10 lg:-mt-14">
            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] border border-[#F1F5F9] bg-white group">
              <img
                src={converterCardMock}
                alt="Convert Image, Video, and 3D Model options"
                className="w-full h-auto block select-none pointer-events-none"
              />

              {/* Interactive Overlay Click Areas for each card */}
              <div className="absolute inset-0 flex items-stretch">
                {/* 1. Image Card Area */}
                <button
                  type="button"
                  onClick={() => handleChooseFile('image')}
                  title="Choose Image File"
                  aria-label="Choose Image File"
                  className="flex-1 cursor-pointer transition-colors hover:bg-slate-900/[0.02] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40"
                />

                {/* 2. Video Card Area */}
                <button
                  type="button"
                  onClick={() => handleChooseFile('video')}
                  title="Choose Video File"
                  aria-label="Choose Video File"
                  className="flex-1 cursor-pointer transition-colors hover:bg-slate-900/[0.02] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40"
                />

                {/* 3. 3D Model Card Area */}
                <button
                  type="button"
                  onClick={() => handleChooseFile('3d')}
                  title="Choose 3D Model File"
                  aria-label="Choose 3D Model File"
                  className="flex-1 cursor-pointer transition-colors hover:bg-slate-900/[0.02] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: IMAGE CONVERTER & COMPRESSOR
        ========================================= */}
        <section className="relative w-full py-16 sm:py-24 overflow-hidden border-t border-[#F1F5F9]/80">
          {/* Subtle floral background element */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 max-w-[360px] opacity-70">
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
        <section className="relative w-full py-16 sm:py-24 overflow-hidden bg-[#F8FAFC]">
          {/* Subtle film reel background element */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 max-w-[340px] opacity-70">
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
        <section className="relative w-full py-16 sm:py-24 overflow-hidden border-t border-[#F1F5F9]/80">
          {/* Geometric 3D wireframe background element */}
          <div className="absolute right-0 bottom-0 pointer-events-none select-none z-0 max-w-[420px] opacity-75">
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
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#94A3B8] uppercase block mb-2 sm:mb-3">
                  READY TO CONVERT?
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#111827]">
                  Make Your Media Lighter. <br />
                  Make Your <span className="text-[#EA580C]">Experience Better.</span>
                </h3>
                <p className="mt-3 text-sm sm:text-base text-[#64748B]">
                  Optimize images, videos, and 3D models for faster loading, efficient storage, and high-quality digital experiences.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={handleStartConverting}
                  className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#111827] hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg group"
                >
                  <span>Start Converting Now</span>
                  <Icon
                    icon="lucide:arrow-up-right"
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
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
