import React from 'react';
import { Icon } from '@iconify/react';
import heroBg from '../../assets/Features/Converter/Feature.webp';
import Creation1Img from '../../assets/Features/Creation/Creation1.webp';
import Creation2Img from '../../assets/Features/Creation/Creation2.webp';
import Creation3Img from '../../assets/Features/Creation/Creation3.webp';

export default function CreationFeatures() {
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
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center">
              <img
                src={heroBg}
                alt="FlipiBook Creation Preview"
                className="w-full h-full object-contain object-right"
              />
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 w-full max-w-[94vw] mx-auto px-[3vw] py-[2vw]">
              <div className="max-w-[40vw]">
                {/* Category Tag */}
                <div className="flex items-center gap-[0.5vw] mb-[0.8vw]">
                  <span className="text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    CREATION
                  </span>
                  <span className="w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Headline */}
                <h1 className="text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-[1.12]">
                  Static is <span className="text-[#EA580C]">Out</span> <br />
                  Interactive is <span className="text-[#EA580C]">In</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-[0.9vw] text-[0.86vw] text-[#64748B] leading-relaxed max-w-[34vw]">
                  Start your project exactly how you want. Our dashboard offers complete design freedom and fluid layout controls.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-[0.6vw] mt-[1.4vw]">
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    Custom Layouts &amp; Grids
                  </span>
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    High Quality Output
                  </span>
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:shield-check" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    Secure &amp; Private
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: 2-COLUMN CREATION CARDS GRID
        ========================================= */}
        <section className="relative w-full pt-4 pb-12 sm:pt-6 sm:pb-16 bg-white">
          <div className="max-w-[92vw] mx-auto px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
              
              {/* =========================================
                  LEFT COLUMN
              ========================================= */}
              <div className="flex flex-col gap-5 sm:gap-6">
                
                {/* 1. UPLOAD AND TRANSFORM (IMAGE CARD) */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-sm group">
                  <img
                    src={Creation1Img}
                    alt="Upload and Transform in Seconds"
                    className="w-full h-[280px] sm:h-[340px] md:h-[370px] object-cover block"
                  />
                  {/* Overlay Title */}
                  <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10">
                    <h3 className="text-white text-[18px] sm:text-[21px] md:text-[22px] font-semibold leading-snug drop-shadow-md flex items-start gap-1.5">
                      <span className="shrink-0">1.</span>
                      <span>
                        Upload and Transform
                        <br />
                        in Seconds
                      </span>
                    </h3>
                  </div>
                </div>

                {/* PAIR 1: TWO MINI CARDS (CARD 1 DETAILS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Effortless File Import (White Card) */}
                  <div className="relative bg-white border border-[#D5D9E0] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[175px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <Icon icon="ph:file-text" className="w-6 h-6 text-[#EA580C]" />
                        <span className="w-7 h-7 rounded-full bg-[#EA580C] text-white text-xs font-semibold flex items-center justify-center">1</span>
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#111827] mb-2 leading-snug">
                        Effortless File Import:
                      </h4>
                      <p className="text-[12px] sm:text-[12.5px] text-[#64748B] leading-relaxed">
                        Upload standard formats like PDF, Word, and PowerPoint with smart conversion that preserves every layout and visual detail.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Design Studio (Grey Card) */}
                  <div className="bg-[#D3D8DF] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[175px]">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <Icon icon="ph:sparkle-fill" className="w-6 h-6 text-[#111827]" />
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#111827] mb-2 leading-snug">
                        Interactive Design Studio:
                      </h4>
                      <p className="text-[12px] sm:text-[12.5px] text-[#475569] leading-relaxed">
                        Customize your uploaded document in our editor by adding clickable buttons, external links, social integrations, map directions, and popup templates.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. DESIGN FASTER WITH READY-MADE LAYOUTS (IMAGE CARD) */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-sm mt-1 sm:mt-2 group">
                  <img
                    src={Creation3Img}
                    alt="Design Faster With Ready-Made Layouts"
                    className="w-full h-[180px] sm:h-[200px] md:h-[220px] object-cover block"
                  />
                  {/* Overlay Title */}
                  <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10">
                    <h3 className="text-white text-[16px] sm:text-[19px] md:text-[20px] font-semibold leading-snug drop-shadow-md flex items-start gap-1.5">
                      <span className="shrink-0">3.</span>
                      <span>
                        Design Faster With Ready-
                        <br />
                        Made Layouts
                      </span>
                    </h3>
                  </div>
                </div>

              </div>

              {/* =========================================
                  RIGHT COLUMN
              ========================================= */}
              <div className="flex flex-col gap-5 sm:gap-6">
                
                {/* PAIR 2: TWO MINI CARDS (CARD 2 DETAILS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Custom Dimensions (White Card) */}
                  <div className="relative bg-white border border-[#D5D9E0] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[175px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <Icon icon="ph:crop" className="w-6 h-6 text-[#EA580C]" />
                        <span className="w-7 h-7 rounded-full bg-[#EA580C] text-white text-xs font-semibold flex items-center justify-center">2</span>
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#111827] mb-2 leading-snug">
                        Custom Dimensions
                      </h4>
                      <p className="text-[12px] sm:text-[12.5px] text-[#64748B] leading-relaxed">
                        Choose standard sizes like A3 and A4 or set custom dimensions, then select portrait or landscape orientation and specify your exact page count.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Design Studio (Dark Card) */}
                  <div className="bg-[#353535] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[175px]">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <Icon icon="ph:pen-nib" className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-semibold text-white mb-2 leading-snug">
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
                    className="w-full h-[280px] sm:h-[340px] md:h-[370px] object-cover block"
                  />
                  {/* Overlay Title */}
                  <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10">
                    <h3 className="text-white text-[18px] sm:text-[21px] md:text-[22px] font-semibold leading-snug drop-shadow-md flex items-start gap-1.5">
                      <span className="shrink-0">2.</span>
                      <span>
                        Build Your Publication
                        <br />
                        Design From Zero
                      </span>
                    </h3>
                  </div>
                </div>

                {/* PAIR 3: TWO MINI CARDS (CARD 3 DETAILS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 sm:mt-2">
                  {/* Industry-Ready Templates (White Card) */}
                  <div className="relative bg-white border border-[#D5D9E0] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[175px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <Icon icon="ph:layout" className="w-6 h-6 text-[#EA580C]" />
                        <span className="w-7 h-7 rounded-full bg-[#EA580C] text-white text-xs font-semibold flex items-center justify-center">3</span>
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#111827] mb-2 leading-snug">
                        Industry-Ready Templates:
                      </h4>
                      <p className="text-[12px] sm:text-[12.5px] text-[#64748B] leading-relaxed">
                        Jumpstart your project with ready-made layouts built specifically for catalogues, magazines, portfolios, and brochures.
                      </p>
                    </div>
                  </div>

                  {/* Fast & Flexible Customization (Dark Card) */}
                  <div className="bg-[#353535] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[175px]">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <Icon icon="ph:sliders-horizontal" className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-[14px] sm:text-[15px] font-semibold text-white mb-2 leading-snug">
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
          </div>
        </section>
      </main>
    </div>
  );
}
