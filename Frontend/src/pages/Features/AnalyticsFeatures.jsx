import React from 'react';
import { Icon } from '@iconify/react';

// Analytics Assets
import heroBg from '../../assets/Features/Converter/Feature.webp';
import analytics1Woman from '../../assets/Features/Analytics/Analytics1.webp';
import analytics2Laptop from '../../assets/Features/Analytics/Analytics2.webp';
import analytics3Touch from '../../assets/Features/Analytics/Analytics3.webp';

export default function AnalyticsFeatures() {
  return (
    <div className="w-full min-h-screen bg-white text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EC5137]/10 selection:text-[#EC5137]">
      <main className="w-full flex-1">
        {/* =========================================
            SECTION 1: HERO (STATISTICS BANNER)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop illustration background on the right */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center">
              <img
                src={heroBg}
                alt="FlipiBook Statistics & Analytics Dashboard Preview"
                className="w-full h-full object-contain object-right"
              />
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 w-full max-w-[94vw] mx-auto px-[3vw] py-[2vw]">
              <div className="max-w-[40vw]">
                {/* Statistics tag with divider line */}
                <div className="flex items-center gap-[0.5vw] mb-[0.8vw]">
                  <span className="text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    STATISTICS
                  </span>
                  <span className="w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Heading */}
                <h1 className="text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-[1.12]">
                  Make Every Page <br />
                  <span className="text-[#EA580C]">Clickable</span> &amp; Measurable
                </h1>

                {/* Subtitle */}
                <p className="mt-[0.9vw] text-[0.86vw] text-[#64748B] leading-relaxed max-w-[34vw]">
                  Keep buyers exploring longer with smooth page turns, embedded media, and instant product lookups across all devices.
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
            SECTION 2: HEADER BANNER
        ========================================= */}
        <section className="relative w-full pt-6 pb-4 md:pt-8 md:pb-16 bg-white text-center">
          <div className="max-w-[1000px] mx-auto px-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
              <span className="w-10 sm:w-14 h-[2.5px] bg-[#C86D58] rounded-full"></span>
              <h2 className="text-[22px] sm:text-[30px] md:text-[36px] font-semibold text-[#111827] tracking-tight leading-tight">
                Make Every Page Interactive &amp; Trackable
              </h2>
              <span className="w-10 sm:w-14 h-[2.5px] bg-[#D48B6A] rounded-full"></span>
            </div>
            <p className="text-[13px] sm:text-[14.5px] text-[#4B5563] max-w-[650px] mx-auto leading-relaxed font-normal">
              Interactive digital catalogues capture 3x more reader attention than static PDFs and turn passive browsing into direct inquiries.
            </p>
          </div>
        </section>

        {/* =========================================
            SECTION 3: 3-COLUMN INTERACTIVE METRICS GRID
        ========================================= */}
        <section className="relative w-full pb-14 md:pb-18 bg-white">
          <div className="max-w-[92vw] w-full mx-auto px-[2vw]">
            {/* The Border Grid Frame */}
            <div className="w-full border border-[#BED2CF] rounded-[2px] overflow-hidden grid grid-cols-1 md:grid-cols-3">
              
              {/* COLUMN 1: Content (30% height) + Image (70% height) */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r border-[#BED2CF] max-h-[630px]">
                {/* Content: 30% */}
                <div className="bg-[#F5F5F5] p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center text-center h-[30%] min-h-[130px] md:min-h-[140px] border-b border-[#BED2CF]">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#2F87AD] text-white flex items-center justify-center mb-2 shadow-xs">
                    <Icon icon="lucide:eye" className="w-[20px] h-[20px] stroke-[1.8]" />
                  </div>
                  <h3 className="text-[14px] md:text-[14.5px] font-semibold text-[#111827] tracking-wider uppercase mb-1">
                    VIEWS &amp; TIME SPENT
                  </h3>
                  <p className="text-[11.5px] md:text-[12px] text-[#64748B] italic max-w-[250px] leading-relaxed font-normal">
                    Track total publication views and average reading time down to each individual page
                  </p>
                </div>
                {/* Image: 70% */}
                <div className="relative bg-white overflow-hidden h-[70%] min-h-[220px] md:min-h-[300px] flex items-center justify-center">
                  <img
                    src={analytics1Woman}
                    alt="Woman analyzing digital publication"
                    className="w-full h-full object-cover object-center select-none"
                  />
                </div>
              </div>

              {/* COLUMN 2: Image (70% height) + Content (30% height) */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r border-[#BED2CF] max-h-[630px]">
                {/* Image: 70% */}
                <div className="relative bg-white overflow-hidden h-[70%] min-h-[220px] md:min-h-[260px] border-b border-[#BED2CF] flex items-center justify-center">
                  <img
                    src={analytics2Laptop}
                    alt="Analytics Dashboard on Laptop"
                    className="w-full h-full object-cover object-center select-none"
                  />
                </div>
                {/* Content: 30% */}
                <div className="bg-[#F5F5F5] p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center text-center h-[30%] min-h-[130px] md:min-h-[140px]">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#7FBCAC] text-white flex items-center justify-center mb-2 shadow-xs">
                    <Icon icon="lucide:pointer" className="w-[20px] h-[20px] stroke-[1.8]" />
                  </div>
                  <h3 className="text-[14px] md:text-[14.5px] font-semibold text-[#111827] tracking-wider uppercase mb-1">
                    INTERACTIVE CLICKS
                  </h3>
                  <p className="text-[11.5px] md:text-[12px] text-[#64748B] italic max-w-[250px] leading-relaxed font-normal">
                    Track total clicks across all embedded links
                  </p>
                </div>
              </div>

              {/* COLUMN 3: Content (30% height) + Image (70% height) */}
              <div className="flex flex-col max-h-[630px]">
                {/* Content: 30% */}
                <div className="bg-[#F5F5F5] p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center text-center h-[30%] min-h-[130px] md:min-h-[140px] border-b border-[#BED2CF]">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#A87ABB] text-white flex items-center justify-center mb-2 shadow-xs">
                    <Icon icon="lucide:arrow-down-to-line" className="w-[20px] h-[20px] stroke-[1.8]" />
                  </div>
                  <h3 className="text-[14px] md:text-[14.5px] font-semibold text-[#111827] tracking-wider uppercase mb-1">
                    REACH &amp; DOWNLOADS
                  </h3>
                  <p className="text-[11.5px] md:text-[12px] text-[#64748B] italic max-w-[250px] leading-relaxed font-normal">
                    Measure social shares along side total downloads of your original PDF file.
                  </p>
                </div>
                {/* Image: 70% */}
                <div className="relative bg-white overflow-hidden h-[70%] min-h-[220px] md:min-h-[260px] flex items-center justify-center">
                  <img
                    src={analytics3Touch}
                    alt="Interactive finger tap and analytics engagement"
                    className="w-full h-full object-cover object-center select-none"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
