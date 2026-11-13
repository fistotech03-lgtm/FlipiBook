import React from 'react';
import { Icon } from '@iconify/react';
import heroBg from '../../assets/Features/Converter/Feature.webp';
import Shelf1Img from '../../assets/Features/Shelf/Shelf1.webp';
import Shelf2Img from '../../assets/Features/Shelf/Shelf2.webp';

export default function MyShelfFeatures() {
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
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center">
              <img
                src={heroBg}
                alt="FlipiBook My Shelf Preview"
                className="w-full h-full object-contain object-right"
              />
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 w-full max-w-[94vw] mx-auto px-[3vw] py-[2vw]">
              <div className="max-w-[40vw]">
                {/* Category Tag */}
                <div className="flex items-center gap-[0.5vw] mb-[0.8vw]">
                  <span className="text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    SHELF
                  </span>
                  <span className="w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Headline */}
                <h1 className="text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-[1.12]">
                  Your Entire Library <br />
                  In <span className="text-[#EA580C]">One Place</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-[0.9vw] text-[0.86vw] text-[#64748B] leading-relaxed max-w-[34vw]">
                  Organize all your digital catalogues and publications in folders for instant access and publishing.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-[0.6vw] mt-[1.4vw]">
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    Smart Folder
                  </span>
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    Instant Sharing
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
            SECTION 2: CENTER HEADING & SUBTITLE
        ========================================= */}
        <section className="relative w-full pt-6 pb-4 sm:pt-8 sm:pb-6 text-center bg-[#F6F6F6]">
          <div className="max-w-[900px] mx-auto px-4">
            <h2 className="text-[26px] sm:text-[34px] md:text-[38px] font-semibold text-[#111827] tracking-tight leading-tight mb-2">
              Showcase &amp; Organize Your Published Work
            </h2>
            <p className="text-[13px] sm:text-[15px] text-[#64748B] max-w-[700px] mx-auto leading-relaxed">
              A centralized library to store, sort, and manage all your interactive publications and 3D models in one place.
            </p>
          </div>
        </section>

        {/* =========================================
            SECTION 3: INTERACTIVE SHELVES & FEATURE CARDS
        ========================================= */}
        <section className="relative w-full bg-[#F6F6F6] py-4">
          <div className="max-w-[92vw] mx-auto px-[2vw]">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">

              {/* LEFT COLUMN: OVERLAPPING SHELF VISUALS */}
              <div className="w-full lg:w-[60%] relative flex flex-col gap-4 justify-center">
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

              {/* RIGHT COLUMN: STAGGERED / STEPPED FEATURE CARDS */}
              <div className="w-full lg:w-[40%] flex flex-col gap-16 sm:gap-27 py-2">

                {/* CARD 1: Customized Branded Book Shelf (Shifted furthest right) */}
                <div className="w-full sm:w-[88%] sm:ml-[12%] bg-white rounded-2xl p-5 sm:p-10 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-[#EDEDED] flex items-center gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-xl bg-[#EAB308] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="ph:books-fill" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[14.5px] sm:text-[15.5px] font-semibold text-[#111827] mb-1 leading-snug">
                      Customized Branded Book Shelf:
                    </h3>
                    <p className="text-[12px] sm:text-[13px] text-[#64748B] leading-relaxed">
                      Display a collection of flipbooks on a digital, brand-styled bookshelf interface that can be embedded or shared.
                    </p>
                  </div>
                </div>

                {/* CARD 2: Private Folder (Shifted to middle / left, overlapping visual flow) */}
                <div className="w-full sm:w-[88%] sm:ml-0 bg-white rounded-2xl p-5 sm:p-10 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-[#EDEDED] flex items-center gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="lucide:folder" className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-[14.5px] sm:text-[15.5px] font-semibold text-[#111827] mb-1 leading-snug">
                      Private Folder:
                    </h3>
                    <p className="text-[12px] sm:text-[13px] text-[#64748B] leading-relaxed">
                      Store publications securely away from team view or public access.
                    </p>
                  </div>
                </div>

                {/* CARD 3: Shared Folder (Shifted right / centered step) */}
                <div className="w-full sm:w-[88%] sm:ml-[14%] bg-white rounded-2xl p-5 sm:p-10 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-[#EDEDED] flex items-center gap-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="lucide:folder-input" className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-[14.5px] sm:text-[15.5px] font-semibold text-[#111827] mb-1 leading-snug">
                      Shared Folder:
                    </h3>
                    <p className="text-[12px] sm:text-[13px] text-[#64748B] leading-relaxed">
                      Create centralized repositories for collaborative team access and review.
                    </p>
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
