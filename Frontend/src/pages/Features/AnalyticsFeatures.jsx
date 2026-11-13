import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

// Analytics Assets
import heroBg from '../../assets/Features/Converter/Feature.webp';
import analytics1Woman from '../../assets/Features/Analytics/Analytics1.webp';
import analytics2Laptop from '../../assets/Features/Analytics/Analytics2.webp';
import analytics3Touch from '../../assets/Features/Analytics/Analytics3.webp';

export default function AnalyticsFeatures() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EC5137]/10 selection:text-[#EC5137]">
      <main className="w-full flex-1">
        {/* =========================================
            SECTION 1: HERO (STATISTICS BANNER)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop illustration background on the right */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center opacity-25 md:opacity-100">
              <img
                src={heroBg}
                alt="FlipiBook Statistics & Analytics Dashboard Preview"
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
                {/* Statistics tag with divider line */}
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-2 md:mb-[0.8vw]">
                  <span className="text-[11px] sm:text-xs md:text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    STATISTICS
                  </span>
                  <span className="w-8 md:w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.12]">
                  Make Every Page <br className="hidden sm:inline" />
                  <span className="text-[#EA580C]">Clickable</span> &amp; Measurable
                </h1>

                {/* Subtitle */}
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.86vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Keep buyers exploring longer with smooth page turns, embedded media, and instant product lookups across all devices.
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
            SECTION 2: HEADER BANNER
        ========================================= */}
        <section className="relative w-full pt-6 pb-4 md:pt-8 md:pb-14 bg-white text-center">
          <div className="max-w-[1000px] mx-auto px-4">
            <div className="flex items-center justify-center gap-2.5 sm:gap-4 mb-2.5 sm:mb-3">
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#C86D58] rounded-full"></span>
              <h2 className="text-xl sm:text-[30px] md:text-[36px] font-semibold text-[#111827] tracking-tight leading-tight">
                Make Every Page Interactive &amp; Trackable
              </h2>
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#D48B6A] rounded-full"></span>
            </div>
            <p className="text-xs sm:text-[14.5px] text-[#4B5563] max-w-[650px] mx-auto leading-relaxed font-normal">
              Interactive digital catalogues capture 3x more reader attention than static PDFs and turn passive browsing into direct inquiries.
            </p>
          </div>
        </section>

        {/* =========================================
            SECTION 3: 3-COLUMN INTERACTIVE METRICS GRID
        ========================================= */}
        <section className="relative w-full pb-14 md:pb-18 bg-white">
          <div className="max-w-[92vw] w-full mx-auto px-4 md:px-[2vw]">
            {/* The Border Grid Frame */}
            <div className="w-full border border-[#BED2CF] rounded-sm overflow-hidden grid grid-cols-1 md:grid-cols-3">
              
              {/* COLUMN 1: Content + Image */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r border-[#BED2CF]">
                {/* Content */}
                <div className="bg-[#F5F5F5] p-5 lg:p-6 flex flex-col items-center justify-center text-center py-6 md:py-8 border-b border-[#BED2CF]">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#2F87AD] text-white flex items-center justify-center mb-2 shadow-xs">
                    <Icon icon="lucide:eye" className="w-[20px] h-[20px] stroke-[1.8]" />
                  </div>
                  <h3 className="text-sm md:text-[14.5px] font-semibold text-[#111827] tracking-wider uppercase mb-1">
                    VIEWS &amp; TIME SPENT
                  </h3>
                  <p className="text-xs md:text-[12px] text-[#64748B] italic max-w-[250px] leading-relaxed font-normal">
                    Track total publication views and average reading time down to each individual page
                  </p>
                </div>
                {/* Image */}
                <div className="relative bg-white overflow-hidden min-h-[220px] md:min-h-[300px] h-56 sm:h-72 md:h-auto flex items-center justify-center">
                  <img
                    src={analytics1Woman}
                    alt="Woman analyzing digital publication"
                    className="w-full h-full object-cover object-center select-none"
                  />
                </div>
              </div>

              {/* COLUMN 2: On mobile show Content then Image for consistent reading experience */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r border-[#BED2CF]">
                {/* Image (Desktop top, mobile bottom) */}
                <div className="relative bg-white overflow-hidden min-h-[220px] md:min-h-[260px] h-56 sm:h-72 md:h-auto border-b md:border-b border-[#BED2CF] order-2 md:order-1 flex items-center justify-center">
                  <img
                    src={analytics2Laptop}
                    alt="Analytics Dashboard on Laptop"
                    className="w-full h-full object-cover object-center select-none"
                  />
                </div>
                {/* Content (Desktop bottom, mobile top) */}
                <div className="bg-[#F5F5F5] p-5 lg:p-6 flex flex-col items-center justify-center text-center py-6 md:py-8 order-1 md:order-2 border-b md:border-b-0 border-[#BED2CF]">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#7FBCAC] text-white flex items-center justify-center mb-2 shadow-xs">
                    <Icon icon="lucide:pointer" className="w-[20px] h-[20px] stroke-[1.8]" />
                  </div>
                  <h3 className="text-sm md:text-[14.5px] font-semibold text-[#111827] tracking-wider uppercase mb-1">
                    INTERACTIVE CLICKS
                  </h3>
                  <p className="text-xs md:text-[12px] text-[#64748B] italic max-w-[250px] leading-relaxed font-normal">
                    Track total clicks across all embedded links
                  </p>
                </div>
              </div>

              {/* COLUMN 3: Content + Image */}
              <div className="flex flex-col">
                {/* Content */}
                <div className="bg-[#F5F5F5] p-5 lg:p-6 flex flex-col items-center justify-center text-center py-6 md:py-8 border-b border-[#BED2CF]">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#A87ABB] text-white flex items-center justify-center mb-2 shadow-xs">
                    <Icon icon="lucide:arrow-down-to-line" className="w-[20px] h-[20px] stroke-[1.8]" />
                  </div>
                  <h3 className="text-sm md:text-[14.5px] font-semibold text-[#111827] tracking-wider uppercase mb-1">
                    REACH &amp; DOWNLOADS
                  </h3>
                  <p className="text-xs md:text-[12px] text-[#64748B] italic max-w-[250px] leading-relaxed font-normal">
                    Measure social shares along side total downloads of your original PDF file.
                  </p>
                </div>
                {/* Image */}
                <div className="relative bg-white overflow-hidden min-h-[220px] md:min-h-[260px] h-56 sm:h-72 md:h-auto flex items-center justify-center">
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
      <Footer />
    </div>
  );
}
