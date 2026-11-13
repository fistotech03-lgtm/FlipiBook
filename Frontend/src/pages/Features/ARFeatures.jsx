import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';
import heroBg from '../../assets/Features/Converter/Feature.webp';
import ARImg from '../../assets/Features/AR/AR.webp';

export default function ARFeatures() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EA580C]/10 selection:text-[#EA580C]">
      <main className="w-full flex-1 pb-2">
        {/* =========================================
            SECTION 1: HERO (AUGMENTED REALITY BANNER)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop + rock 3D illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center opacity-25 md:opacity-100">
              <img
                src={heroBg}
                alt="FlipiBook Augmented Reality Preview"
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
                {/* Category Tag */}
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-2 md:mb-[0.8vw]">
                  <span className="text-[11px] sm:text-xs md:text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    AUGMENTED REALITY
                  </span>
                  <span className="w-8 md:w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.12]">
                  Bring Digital Objects <br className="hidden sm:inline" />
                  Into the <span className="text-[#EA580C]">Real World</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.86vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Turn flat 3D models into interactive, real-world experiences you can view and place anywhere in seconds.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-[0.6vw] mt-3.5 md:mt-[1.4vw]">
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Instant Web AR
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    360° Interactive View
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Real-Space Placement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: CENTER HEADING & SUBTITLE
        ========================================= */}
        <section className="relative w-full pt-6 pb-4 sm:pt-8 sm:pb-6 text-center bg-white">
          <div className="max-w-[960px] mx-auto px-4">
            <h2 className="text-xl sm:text-[34px] md:text-[38px] font-semibold text-[#111827] tracking-tight leading-tight mb-2">
              <span className="text-[#EA580C]">AR</span> – Bring Your Catalogue Into Reality
            </h2>
            <p className="text-xs sm:text-[15px] text-[#4B5563] max-w-[760px] mx-auto leading-relaxed">
              Transform flat product pages into interactive 3D experiences that users can place, scale, and explore right in their own environment.
            </p>
          </div>
        </section>

        {/* =========================================
            SECTION 3: TABLET AR DEMO & 2x3 FEATURE CARDS
        ========================================= */}
        <section className="relative w-full pb-12 bg-white">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
              
              {/* LEFT COLUMN: TABLET AR VISUAL (5 Cols on LG) */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] group transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={ARImg}
                    alt="AR Interactive Tablet View"
                    className="w-full h-auto object-contain block drop-shadow-xl"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: 2x3 FEATURE CARDS GRID (7 Cols on LG) */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                
                {/* 1. Real-world 3D placement */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#F0D5CD] shadow-[0_2px_8px_rgba(234,88,12,0.04)] flex items-start gap-3.5 sm:gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#5586A7] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Icon icon="ph:cube-bold" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                      Real-world 3D placement:
                    </h3>
                    <p className="text-xs sm:text-[12px] text-[#64748B] leading-relaxed">
                      Anchor digital models onto physical surfaces (floors, tables) using the device camera.
                    </p>
                  </div>
                </div>

                {/* 2. QR code-based AR access */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#F0D5CD] shadow-[0_2px_8px_rgba(234,88,12,0.04)] flex items-start gap-3.5 sm:gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#9F564F] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Icon icon="ph:qr-code-bold" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                      QR code-based AR access:
                    </h3>
                    <p className="text-xs sm:text-[12px] text-[#64748B] leading-relaxed">
                      Allow users to scan a code to instantly launch the AR experience on their mobile devices.
                    </p>
                  </div>
                </div>

                {/* 3. Rotate and zoom */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#F0D5CD] shadow-[0_2px_8px_rgba(234,88,12,0.04)] flex items-start gap-3.5 sm:gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#44A06F] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Icon icon="ph:arrows-out-cardinal-bold" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                      Rotate and zoom:
                    </h3>
                    <p className="text-xs sm:text-[12px] text-[#64748B] leading-relaxed">
                      Allow users to manipulate the scale and orientation of the AR object in their physical space.
                    </p>
                  </div>
                </div>

                {/* 4. Interactive hotspots */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#F0D5CD] shadow-[0_2px_8px_rgba(234,88,12,0.04)] flex items-start gap-3.5 sm:gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#9B5BA5] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Icon icon="ph:target-bold" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                      Interactive hotspots:
                    </h3>
                    <p className="text-xs sm:text-[12px] text-[#64748B] leading-relaxed">
                      Place tap-targets on AR models to reveal specifications, animations, or links.
                    </p>
                  </div>
                </div>

                {/* 5. Universal Access */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#F0D5CD] shadow-[0_2px_8px_rgba(234,88,12,0.04)] flex items-start gap-3.5 sm:gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#DF713D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Icon icon="ph:device-mobile-bold" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                      Universal Access:
                    </h3>
                    <p className="text-xs sm:text-[12px] text-[#64748B] leading-relaxed">
                      Deliver seamless, interactive 3D experiences that work perfectly on standard smartphones and tablets.
                    </p>
                  </div>
                </div>

                {/* 6. Realtime Shadows */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#F0D5CD] shadow-[0_2px_8px_rgba(234,88,12,0.04)] flex items-start gap-3.5 sm:gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#BFC56B] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Icon icon="ph:sun-dim-bold" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                      Realtime Shadows:
                    </h3>
                    <p className="text-xs sm:text-[12px] text-[#64748B] leading-relaxed">
                      Cast dynamic shadows onto the real-world environment to enhance the illusion of presence.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
