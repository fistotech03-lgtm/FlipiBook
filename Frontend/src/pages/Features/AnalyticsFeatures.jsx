import React from 'react';
import { Icon } from '@iconify/react';

// Analytics Assets
import heroLaptopRight from '../../assets/Features/Analytics/hero_laptop_right.png';
import analytics1Woman from '../../assets/Features/Analytics/Analytics1.webp';
import analytics2Laptop from '../../assets/Features/Analytics/Analytics2.webp';
import analytics3Touch from '../../assets/Features/Analytics/Analytics3.webp';

export default function AnalyticsFeatures() {
  return (
    <div className="w-full min-h-screen bg-white text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EC5137]/10 selection:text-[#EC5137]">
      <main className="w-full flex-1">
        {/* =========================================
            SECTION 1: HERO (STATISTICS BANNER - EXACT LIKE CONVERTER)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-white border-b border-[#F1F5F9]/60">
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center min-h-[19vw]">
            {/* The laptop illustration background on the right */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center">
              <img
                src={heroLaptopRight}
                alt="FlipiBook Statistics & Analytics Dashboard Preview"
                className="w-full md:w-[54vw] h-full object-contain object-right"
              />
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 w-full max-w-[94vw] mx-auto px-[3vw] py-[2.2vw]">
              <div className="max-w-[42vw]">
                {/* Statistics tag with divider line */}
                <div className="flex items-center gap-[0.5vw] mb-[0.8vw]">
                  <span className="text-[0.72vw] font-bold tracking-[0.22em] text-[#94A3B8] uppercase">
                    STATISTICS
                  </span>
                  <span className="w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Heading */}
                <h1 className="text-[3.2vw] font-bold tracking-tight text-[#111827] leading-[1.12]">
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
        <section className="relative w-full pt-10 pb-8 md:pt-14 md:pb-10 bg-white text-center">
          <div className="max-w-[1000px] mx-auto px-4">
            <h2 className="text-[16px] sm:text-[26px] md:text-[32px] font-extrabold text-[#0B132B] tracking-tight leading-[1.18] mb-3">
              Turn Static PDF's Into High-Converting <br className="hidden sm:inline" />
              Catalogue
            </h2>
            <p className="text-[14px] sm:text-[15.5px] text-[#64748B] max-w-[850px] mx-auto leading-relaxed font-normal">
              Interactive digital catalogues capture 3x more reader attention than static PDFs and turn passive browsing into direct inquiries.
            </p>
          </div>
        </section>

        {/* =========================================
            SECTION 3: 3x2 INTERACTIVE METRICS GRID
        ========================================= */}
        <section className="relative w-full pb-20 md:pb-28 bg-white">
          <div className="max-w-[1160px] w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* The Border Grid Frame */}
            <div className="w-full border border-[#C6DCDB] rounded-[2px] overflow-hidden grid grid-cols-1 md:grid-cols-3">
              {/* CELL 1 (Row 1, Col 1): VIEWS & TIME SPENT */}
              <div className="bg-[#F5F5F5] p-8 sm:p-10 lg:p-12 flex flex-col items-center justify-center text-center min-h-[300px] md:min-h-[340px] border-b md:border-b md:border-r border-[#C6DCDB]">
                <div className="w-[58px] h-[58px] rounded-full bg-[#EA6A38] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Icon icon="lucide:eye" className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-[17px] md:text-[18px] font-extrabold text-[#0B132B] tracking-wider uppercase mb-3">
                  VIEWS &amp; TIME SPENT
                </h3>
                <p className="text-[14px] md:text-[15px] text-[#64748B] italic max-w-[240px] leading-relaxed font-normal">
                  Track total publication views and average reading time down to each individual page
                </p>
              </div>

              {/* CELL 2 (Row 1, Col 2): LAPTOP CHARTS IMAGE (Analytics2.webp) */}
              <div className="relative bg-white overflow-hidden min-h-[300px] md:min-h-[340px] border-b md:border-b md:border-r border-[#C6DCDB] flex items-center justify-center">
                <img
                  src={analytics2Laptop}
                  alt="Analytics Dashboard on Laptop"
                  className="w-full h-full object-cover object-center select-none"
                />
              </div>

              {/* CELL 3 (Row 1, Col 3): REACH & DOWNLOADS */}
              <div className="bg-[#F5F5F5] p-8 sm:p-10 lg:p-12 flex flex-col items-center justify-center text-center min-h-[300px] md:min-h-[340px] border-b md:border-b border-[#C6DCDB]">
                <div className="w-[58px] h-[58px] rounded-full bg-[#EA6A38] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Icon icon="lucide:download" className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-[17px] md:text-[18px] font-extrabold text-[#0B132B] tracking-wider uppercase mb-3">
                  REACH &amp; DOWNLOADS
                </h3>
                <p className="text-[14px] md:text-[15px] text-[#64748B] italic max-w-[240px] leading-relaxed font-normal">
                  Measure social shares along side total downloads of your original PDF file.
                </p>
              </div>

              {/* CELL 4 (Row 2, Col 1): WOMAN WITH TABLET IMAGE (Analytics1.webp) */}
              <div className="relative bg-white overflow-hidden min-h-[300px] md:min-h-[340px] border-b md:border-b-0 md:border-r border-[#C6DCDB] flex items-center justify-center">
                <img
                  src={analytics1Woman}
                  alt="Woman analyzing digital publication"
                  className="w-full h-full object-cover object-center select-none"
                />
              </div>

              {/* CELL 5 (Row 2, Col 2): INTERACTIVE CLICKS */}
              <div className="bg-[#F5F5F5] p-8 sm:p-10 lg:p-12 flex flex-col items-center justify-center text-center min-h-[300px] md:min-h-[340px] border-b md:border-b-0 md:border-r border-[#C6DCDB]">
                <div className="w-[58px] h-[58px] rounded-full bg-[#EA6A38] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Icon icon="lucide:mouse-pointer-click" className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-[17px] md:text-[18px] font-extrabold text-[#0B132B] tracking-wider uppercase mb-3">
                  INTERACTIVE CLICKS
                </h3>
                <p className="text-[14px] md:text-[15px] text-[#64748B] italic max-w-[240px] leading-relaxed font-normal">
                  Track total clicks across all embedded links
                </p>
              </div>

              {/* CELL 6 (Row 2, Col 3): HAND TOUCH SCREEN IMAGE (Analytics3.webp) */}
              <div className="relative bg-white overflow-hidden min-h-[300px] md:min-h-[340px] flex items-center justify-center">
                <img
                  src={analytics3Touch}
                  alt="Interactive finger tap and analytics engagement"
                  className="w-full h-full object-cover object-center select-none"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
