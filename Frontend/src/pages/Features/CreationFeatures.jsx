import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';
import heroBg from '../../assets/Features/Creation/creation.webp';
import Creation1Img from '../../assets/Features/Creation/Creation1.webp';
import Creation2Img from '../../assets/Features/Creation/Creation2.webp';
import Creation3Img from '../../assets/Features/Creation/Creation3.webp';

export default function CreationFeatures() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EA580C]/10 selection:text-[#EA580C]">
      <main className="w-full flex-1 pb-2">
        {/* =========================================
            SECTION 1: HERO (CREATION BANNER)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop + rock 3D illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center opacity-25 md:opacity-100">
              <img
                src={heroBg}
                alt="FlipiBook Creation Preview"
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
                    CREATION
                  </span>
                  <span className="w-8 md:w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.12]">
                  Static is <span className="text-[#EA580C]">Out</span> <br className="hidden sm:inline" />
                  Interactive is <span className="text-[#EA580C]">In</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.86vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Start your project exactly how you want. Our dashboard offers
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-[0.6vw] mt-3.5 md:mt-[1.4vw]">
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Custom Layouts &amp; Grids
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

        {/* =========================================
            SECTION 2: HEADING & 2-COLUMN CREATION CARDS GRID
        ========================================= */}
        <section className="relative w-full pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-12 md:pb-14 text-center bg-white">
          <div className="max-w-[960px] mx-auto px-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
              <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#111827] tracking-tight">
                Create Interactive Digital Catalogues
              </h2>
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
            </div>
            <p className="text-xs sm:text-sm md:text-[14px] text-[#64748B] mt-2 max-w-xl mx-auto leading-relaxed">
              Transform PDFs and product lists into engaging digital catalogues that attract customers and generate inquiries.
            </p>
          </div>
        </section>

          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw] flex flex-col gap-6">
            {/* Top 2-Column Section: 1 & 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* =========================================
                  LEFT COLUMN:
                  1. Image 1 Card (Upload and Transform in Seconds)
                  2. Mini Cards 1 (Effortless File Import & Interactive Design Studio)
              ========================================= */}
              <div className="flex flex-col gap-6">
                {/* 1. UPLOAD AND TRANSFORM (IMAGE CARD) */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-sm group">
                  <img
                    src={Creation1Img}
                    alt="Upload and Transform in Seconds"
                    className="w-full h-[240px] sm:h-[350px] md:h-[400px] object-cover block"
                  />
                  {/* Overlay Title */}
                  <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-10">
                    <h3 className="text-white text-[17px] sm:text-[21px] md:text-[22px] font-semibold leading-snug drop-shadow-md">
                      1. Upload and Transform
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;in Seconds
                    </h3>
                  </div>
                </div>

                {/* PAIR 1: TWO MINI CARDS (CARD 1 DETAILS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Effortless File Import (White Card) */}
                  <div className="relative bg-white border border-[#D5D9E0] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[190px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Icon icon="ph:file-text" className="w-7 h-7 text-[#EA580C]" />
                        <span 
                          className="text-4xl sm:text-5xl font-extrabold text-transparent select-none leading-none"
                          style={{
                            WebkitTextStroke: '2.5px #EA580C',
                            filter: 'drop-shadow(2.5px 2.5px 0px rgba(234, 88, 12, 0.35))',
                          }}
                        >
                          1
                        </span>
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-bold text-[#111827] mb-2 leading-snug">
                        Effortless File Import:
                      </h4>
                      <p className="text-[12px] sm:text-[12.5px] text-[#64748B] leading-relaxed">
                        Upload standard formats like PDF, Word, and PowerPoint with smart conversion that preserves every layout and visual detail.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Design Studio (Grey Card) */}
                  <div className="bg-[#D3D8DF] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[190px]">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Icon icon="ph:sparkle" className="w-7 h-7 text-[#111827]" />
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-bold text-[#111827] mb-2 leading-snug">
                        Interactive Design Studio:
                      </h4>
                      <p className="text-[12px] sm:text-[12.5px] text-[#475569] leading-relaxed">
                        Customize your uploaded document in our editor by adding clickable buttons, external links, social integrations, map directions, and popup templates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================
                  RIGHT COLUMN:
                  1. Mini Cards 2 (Custom Dimensions & Interactive Design Studio)
                  2. Image 2 Card (Build Your Publication Design From Zero)
              ========================================= */}
              <div className="flex flex-col gap-6">
                {/* PAIR 2: TWO MINI CARDS (CARD 2 DETAILS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Custom Dimensions (White Card) */}
                  <div className="relative bg-white border border-[#D5D9E0] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[190px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Icon icon="ph:crop" className="w-7 h-7 text-[#EA580C]" />
                        <span 
                          className="text-4xl sm:text-5xl font-extrabold text-transparent select-none leading-none"
                          style={{
                            WebkitTextStroke: '2.5px #EA580C',
                            filter: 'drop-shadow(2.5px 2.5px 0px rgba(234, 88, 12, 0.35))',
                          }}
                        >
                          2
                        </span>
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-bold text-[#111827] mb-2 leading-snug">
                        Custom Dimensions
                      </h4>
                      <p className="text-[12px] sm:text-[12.5px] text-[#64748B] leading-relaxed">
                        Choose standard sizes like A3 and A4 or set custom dimensions, then select portrait or landscape orientation and specify your exact page count.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Design Studio (Dark Card) */}
                  <div className="bg-[#353535] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[190px]">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Icon icon="ph:pen-nib" className="w-7 h-7 text-white" />
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-bold text-white mb-2 leading-snug">
                        Interactive Design Studio:
                      </h4>
                      <p className="text-[12px] sm:text-[12.5px] text-[#CBD5E1] leading-relaxed">
                        Use our drag-and-drop editor to arrange text, shapes, slideshows, clickable buttons, and rich media from scratch.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. BUILD YOUR PUBLICATION DESIGN FROM ZERO (IMAGE CARD) */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-sm group">
                  <img
                    src={Creation2Img}
                    alt="Build Your Publication Design From Zero"
                    className="w-full h-[240px] sm:h-[350px] md:h-[400px] object-cover block"
                  />
                  {/* Overlay Title */}
                  <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-10">
                    <h3 className="text-white text-[17px] sm:text-[21px] md:text-[22px] font-semibold leading-snug drop-shadow-md">
                      2. Build Your Publication
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;Design From Zero
                    </h3>
                  </div>
                </div>
              </div>

            </div>

            {/* =========================================
                BOTTOM ROW (ROW 3): SAME HEIGHT ROW
                Image 3 (Left half, 50%) + Mini Cards 3 (Right half, 50% divided into 2 cards)
            ========================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* 3. DESIGN FASTER WITH READY-MADE LAYOUTS (IMAGE CARD) */}
              <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden shadow-sm group">
                <img
                  src={Creation3Img}
                  alt="Design Faster With Ready-Made Layouts"
                  className="w-full h-full object-cover block"
                />
                {/* Overlay Title */}
                <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10">
                  <h3 className="text-white text-[16px] sm:text-[20px] md:text-[21px] font-semibold leading-snug drop-shadow-md">
                    3. Design Faster With Ready-
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;Made Layouts
                  </h3>
                </div>
              </div>

              {/* PAIR 3: TWO MINI CARDS (CARD 3 DETAILS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                {/* Industry-Ready Templates (White Card) */}
                <div className="relative bg-white border border-[#D5D9E0] rounded-2xl p-5 sm:p-6 flex flex-col justify-between h-full shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Icon icon="ph:layout" className="w-7 h-7 text-[#EA580C]" />
                      <span 
                        className="text-4xl sm:text-5xl font-extrabold text-transparent select-none leading-none"
                        style={{
                          WebkitTextStroke: '2.5px #EA580C',
                          filter: 'drop-shadow(2.5px 2.5px 0px rgba(234, 88, 12, 0.35))',
                        }}
                      >
                        3
                      </span>
                    </div>
                    <h4 className="text-[14px] sm:text-[15px] font-bold text-[#111827] mb-2 leading-snug">
                      Industry-Ready Templates:
                    </h4>
                    <p className="text-[12px] sm:text-[12.5px] text-[#64748B] leading-relaxed">
                      Jumpstart your project with ready-made layouts built specifically for catalogues, magazines, portfolios, and brochures.
                    </p>
                  </div>
                </div>

                {/* Fast & Flexible Customization (Dark Card) */}
                <div className="bg-[#353535] rounded-2xl p-5 sm:p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Icon icon="ph:sliders-horizontal" className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-[14px] sm:text-[15px] font-bold text-white mb-2 leading-snug">
                      Fast &amp; Flexible Customization:
                    </h4>
                    <p className="text-[12px] sm:text-[12.5px] text-[#CBD5E1] leading-relaxed">
                      Skip the blank page, drop in your content, and effortlessly adapt colors, fonts, and imagery to match your brand.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
       
      </main>
      <Footer />
    </div>
  );
}
