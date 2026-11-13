import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';
import heroBg from '../../assets/Features/Converter/Feature.webp';
import Explore1Img from '../../assets/Features/Explore/Explore1.webp';
import Explore2Img from '../../assets/Features/Explore/Explore2.webp';

export default function ExploreFeatures() {
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen bg-white text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EA580C]/10 selection:text-[#EA580C]">
      <main className="w-full flex-1 pb-2">
        {/* =========================================
            SECTION 1: HERO (EXPLORE BANNER)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop + rock 3D illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center opacity-25 md:opacity-100">
              <img
                src={heroBg}
                alt="FlipiBook Explore Preview"
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
                    EXPLORE
                  </span>
                  <span className="w-8 md:w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.12]">
                  Public Showcase &amp; <br className="hidden sm:inline" />
                  <span className="text-[#EA580C]">Discovery Hub</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.86vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Discover immersive digital catalogues created by businesses, designers, and creators worldwide.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-[0.6vw] mt-3.5 md:mt-[1.4vw]">
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Featured Catalogues
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Global Audience
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Easy Sharing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: CENTER HEADING (EXPLORE MADE SIMPLE)
        ========================================= */}
        <section className="relative w-full pt-6 pb-4 sm:pt-10 sm:pb-8 text-center bg-white">
          <div className="max-w-[750px] mx-auto px-4 flex items-center justify-center gap-3 sm:gap-6">
            <span className="w-8 sm:w-24 h-[1.5px] bg-[#E2E8F0]"></span>
            <h2 className="text-xl sm:text-[36px] md:text-[40px] font-semibold text-[#111827] tracking-tight leading-tight">
              Explore Made Simple
            </h2>
            <span className="w-8 sm:w-24 h-[1.5px] bg-[#E2E8F0]"></span>
          </div>
        </section>

        {/* =========================================
            SECTION 3: 6 CIRCULAR FEATURE PILLARS
        ========================================= */}
        <section className="relative w-full pb-12 sm:pb-20 bg-white">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4 lg:divide-x divide-[#E2E8F0]">
              
              {/* Item 1: Discover Digital Books */}
              <div className="flex flex-col items-center text-center px-2 sm:px-3">
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white shadow-[0_0_24px_rgba(234,88,12,0.22)] flex items-center justify-center text-[#EA580C] mb-3 sm:mb-4">
                  <Icon icon="ph:book-open" className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-[13px] sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                  Discover Digital Books
                </h3>
                <p className="text-[11.5px] sm:text-[12.5px] text-[#64748B] leading-relaxed max-w-[170px]">
                  Browse digital catalogues and magazines.
                </p>
              </div>

              {/* Item 2: Smart Search */}
              <div className="flex flex-col items-center text-center px-2 sm:px-3">
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white shadow-[0_0_24px_rgba(234,88,12,0.22)] flex items-center justify-center text-[#EA580C] mb-3 sm:mb-4">
                  <Icon icon="ph:magnifying-glass" className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-[13px] sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                  Smart Search
                </h3>
                <p className="text-[11.5px] sm:text-[12.5px] text-[#64748B] leading-relaxed max-w-[170px]">
                  Find books and creators instantly.
                </p>
              </div>

              {/* Item 3: Advanced Filters */}
              <div className="flex flex-col items-center text-center px-2 sm:px-3">
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white shadow-[0_0_24px_rgba(234,88,12,0.22)] flex items-center justify-center text-[#EA580C] mb-3 sm:mb-4">
                  <Icon icon="ph:funnel" className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-[13px] sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                  Advanced Filters
                </h3>
                <p className="text-[11.5px] sm:text-[12.5px] text-[#64748B] leading-relaxed max-w-[170px]">
                  Filter by category, type and location.
                </p>
              </div>

              {/* Item 4: Sort & Discover */}
              <div className="flex flex-col items-center text-center px-2 sm:px-3">
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white shadow-[0_0_24px_rgba(234,88,12,0.22)] flex items-center justify-center text-[#EA580C] mb-3 sm:mb-4">
                  <Icon icon="ph:arrows-down-up" className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-[13px] sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                  Sort &amp; Discover
                </h3>
                <p className="text-[11.5px] sm:text-[12.5px] text-[#64748B] leading-relaxed max-w-[170px]">
                  Explore publications and latest publications.
                </p>
              </div>

              {/* Item 5: Creator Discovery */}
              <div className="flex flex-col items-center text-center px-2 sm:px-3">
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white shadow-[0_0_24px_rgba(234,88,12,0.22)] flex items-center justify-center text-[#EA580C] mb-3 sm:mb-4">
                  <Icon icon="ph:users" className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-[13px] sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                  Creator Discovery
                </h3>
                <p className="text-[11.5px] sm:text-[12.5px] text-[#64748B] leading-relaxed max-w-[170px]">
                  Explore creator profiles and their books.
                </p>
              </div>

              {/* Item 6: Favourites & Follow */}
              <div className="flex flex-col items-center text-center px-2 sm:px-3">
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white shadow-[0_0_24px_rgba(234,88,12,0.22)] flex items-center justify-center text-[#EA580C] mb-3 sm:mb-4">
                  <Icon icon="ph:heart" className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-[13px] sm:text-[15px] font-semibold text-[#111827] mb-1 leading-snug">
                  Favourites &amp; Follow
                </h3>
                <p className="text-[11.5px] sm:text-[12.5px] text-[#64748B] leading-relaxed max-w-[170px]">
                  Save your favourite books and follow creators.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 4: 3-COLUMN EXPLORE SHOWCASE (BOOKS - PREVIEWS - CREATORS)
        ========================================= */}
        <section className="relative w-full pb-16 bg-white">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
              
              {/* LEFT COLUMN: EXPLORE BOOKS (4.5 Cols on LG) */}
              <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-2">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Icon icon="ph:book-open" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-xl sm:text-[30px] font-semibold text-[#111827] tracking-tight">
                    Explore Books
                  </h3>
                </div>

                <p className="text-xs sm:text-[15px] font-semibold text-[#1E293B] mb-4 sm:mb-6 leading-snug">
                  Explore digital publications from different categories and industries.
                </p>

                <ul className="space-y-3 sm:space-y-3.5">
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      Search books by title or keyword.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      Filter by category
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      Choose flipbook type (Landscape, Portrait, Square, 3D).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      View book details – pages, views and ratings.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      Add your favourite books to Favourites.
                    </span>
                  </li>
                </ul>
              </div>

              {/* CENTER COLUMN: PREVIEW SCREENSHOTS (4 Cols on LG) */}
              <div className="lg:col-span-4 flex justify-center items-center my-4 lg:my-0">
                <div className="w-full max-w-[340px] sm:max-w-[370px] bg-white rounded-2xl border border-[#FDBA74]/50 p-2 sm:p-2.5 shadow-md flex flex-col gap-2">
                  <div className="rounded-xl overflow-hidden border border-[#F1F5F9] bg-[#FAFAFA]">
                    <img
                      src={Explore1Img}
                      alt="Explore Books UI Preview"
                      className="w-full h-auto object-cover block"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-[#F1F5F9] bg-[#FAFAFA]">
                    <img
                      src={Explore2Img}
                      alt="Explore Creators UI Preview"
                      className="w-full h-auto object-cover block"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: EXPLORE CREATORS (4 Cols on LG) */}
              <div className="lg:col-span-4 flex flex-col items-start pl-0 lg:pl-4">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#06B6D4] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Icon icon="ph:users" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-xl sm:text-[30px] font-semibold text-[#111827] tracking-tight">
                    Explore Creators
                  </h3>
                </div>

                <p className="text-xs sm:text-[15px] text-[#475569] mb-4 sm:mb-6 leading-snug">
                  Explore creator profiles and discover the digital publications they share.
                </p>

                <ul className="space-y-3 sm:space-y-3.5">
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      Search creators .
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      Filter by industry, location and creator type.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      View creator profiles and details.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      Explore published flipbooks from each creator.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Icon icon="ph:check" className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-[14px] text-[#475569] leading-snug">
                      Follow creators to stay connected with their work.
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
