import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';
import heroBg from '../../assets/Features/Converter/Feature.webp';
import Shelf1Img from '../../assets/Features/Shelf/Shelf1.webp';
import Shelf2Img from '../../assets/Features/Shelf/Shelf2.webp';

export default function MyShelfFeatures() {
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen bg-[#F6F6F6] text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EA580C]/10 selection:text-[#EA580C]">
      <main className="w-full flex-1 pb-2">
        {/* =========================================
            SECTION 1: HERO (SHELF BANNER)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop + rock 3D illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center opacity-25 md:opacity-100">
              <img
                src={heroBg}
                alt="FlipiBook My Shelf Preview"
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
                    SHELF
                  </span>
                  <span className="w-8 md:w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.12]">
                  Your Entire Library <br className="hidden sm:inline" />
                  In <span className="text-[#EA580C]">One Place</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.86vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Organize all your digital catalogues and publications in folders for instant access and publishing.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-[0.6vw] mt-3.5 md:mt-[1.4vw]">
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Smart Folder
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Instant Sharing
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
            SECTION 2: CENTER HEADING & SUBTITLE
        ========================================= */}
        <section className="relative w-full pt-6 pb-4 sm:pt-8 sm:pb-6 text-center bg-[#F6F6F6]">
          <div className="max-w-[900px] mx-auto px-4">
            <h2 className="text-xl sm:text-[34px] md:text-[38px] font-semibold text-[#111827] tracking-tight leading-tight mb-2">
              Showcase &amp; Organize Your Published Work
            </h2>
            <p className="text-xs sm:text-[15px] text-[#64748B] max-w-[700px] mx-auto leading-relaxed">
              A centralized library to store, sort, and manage all your interactive publications and 3D models in one place.
            </p>
          </div>
        </section>

        {/* =========================================
            SECTION 3: INTERACTIVE SHELVES & FEATURE CARDS
        ========================================= */}
        <section className="relative w-full bg-[#F6F6F6] py-6 sm:py-8">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14">

              {/* DESKTOP VIEW: Overlapping visual pair on the left */}
              <div className="hidden lg:flex w-full lg:w-[58%] relative flex-col gap-4 justify-center">
                {/* Shelf 1 (Top Blue Wall Book Shelf) */}
                <div className="relative w-full sm:w-[92%] rounded-2xl overflow-hidden shadow-lg border border-black/5 bg-[#1B3247] z-10 transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={Shelf1Img}
                    alt="Customized Branded Book Shelf"
                    className="w-full max-h-[280px] object-cover object-top block"
                  />
                </div>

                {/* Shelf 2 (Overlapping Lower Light Wall Book Shelf) */}
                <div className="relative w-full sm:w-[92%] sm:ml-[8%] rounded-2xl overflow-hidden shadow-2xl border border-black/5 bg-[#E6DDD3] z-20 transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={Shelf2Img}
                    alt="Warm Wooden Ambient Shelf"
                    className="w-full max-h-[280px] object-cover object-top block"
                  />
                </div>
              </div>

              {/* DESKTOP VIEW: Right column cards */}
              <div className="hidden lg:flex w-full lg:w-[42%] flex-col gap-6 lg:gap-10 py-2">
                {/* CARD 1: Customized Branded Book Shelf */}
                <div className="w-full lg:w-[88%] lg:ml-[12%] bg-white rounded-2xl p-6 lg:p-8 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-[#EDEDED] flex items-center gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-xl bg-[#EAB308] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="ph:books-fill" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[15.5px] font-semibold text-[#111827] mb-1 leading-snug">
                      Customized Branded Book Shelf:
                    </h3>
                    <p className="text-[13px] text-[#64748B] leading-relaxed">
                      Display a collection of flipbooks on a digital, brand-styled bookshelf interface that can be embedded or shared.
                    </p>
                  </div>
                </div>

                {/* CARD 2: Private Folder */}
                <div className="w-full lg:w-[88%] lg:ml-0 bg-white rounded-2xl p-6 lg:p-8 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-[#EDEDED] flex items-center gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="lucide:folder" className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-[15.5px] font-semibold text-[#111827] mb-1 leading-snug">
                      Private Folder:
                    </h3>
                    <p className="text-[13px] text-[#64748B] leading-relaxed">
                      Store publications securely away from team view or public access.
                    </p>
                  </div>
                </div>

                {/* CARD 3: Shared Folder */}
                <div className="w-full lg:w-[88%] lg:ml-[14%] bg-white rounded-2xl p-6 lg:p-8 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-[#EDEDED] flex items-center gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="lucide:folder-input" className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-[15.5px] font-semibold text-[#111827] mb-1 leading-snug">
                      Shared Folder:
                    </h3>
                    <p className="text-[13px] text-[#64748B] leading-relaxed">
                      Create centralized repositories for collaborative team access and review.
                    </p>
                  </div>
                </div>
              </div>

              {/* MOBILE & TABLET VIEW: Content -> Image -> Content -> Image -> Content */}
              <div className="flex lg:hidden flex-col gap-4 w-full">
                {/* 1. CARD 1: Customized Branded Book Shelf (Content) */}
                <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-[#EDEDED] flex items-center gap-3.5 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#EAB308] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="ph:books-fill" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15.5px] font-semibold text-[#111827] mb-1 leading-snug">
                      Customized Branded Book Shelf:
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                      Display a collection of flipbooks on a digital, brand-styled bookshelf interface that can be embedded or shared.
                    </p>
                  </div>
                </div>

                {/* 2. Shelf Image 1 (Image) */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-black/5 bg-[#1B3247]">
                  <img
                    src={Shelf1Img}
                    alt="Customized Branded Book Shelf"
                    className="w-full max-h-[220px] sm:max-h-[280px] object-cover object-top block"
                  />
                </div>

                {/* 3. CARD 2: Private Folder (Content) */}
                <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-[#EDEDED] flex items-center gap-3.5 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="lucide:folder" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15.5px] font-semibold text-[#111827] mb-1 leading-snug">
                      Private Folder:
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                      Store publications securely away from team view or public access.
                    </p>
                  </div>
                </div>

                {/* 4. Shelf Image 2 (Image) */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-black/5 bg-[#E6DDD3]">
                  <img
                    src={Shelf2Img}
                    alt="Warm Wooden Ambient Shelf"
                    className="w-full max-h-[220px] sm:max-h-[280px] object-cover object-top block"
                  />
                </div>

                {/* 5. CARD 3: Shared Folder (Content) */}
                <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-[#EDEDED] flex items-center gap-3.5 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="lucide:folder-input" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15.5px] font-semibold text-[#111827] mb-1 leading-snug">
                      Shared Folder:
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                      Create centralized repositories for collaborative team access and review.
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
