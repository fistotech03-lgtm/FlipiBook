import React from 'react';
import { Icon } from '@iconify/react';
import exploreArrowIcon from '../../assets/Home/explore-arrow-icon.png';

export default function WhyChooseFlipibook() {
  return (
    <section className="w-full bg-white text-[#1C1D21] py-14 lg:py-20 px-6 sm:px-10 lg:px-16 font-poppins relative overflow-hidden">
      
      {/* Top Header Tag Row with Sub-Labels */}
      <div className="w-full mx-auto flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs lg:text-[11px] font-bold tracking-[0.25em] text-[#35363A] uppercase">
            WHY FLIPIBOOK
          </span>
          <div className="w-8 lg:w-10 h-[1.5px] bg-[#35363A]/25"></div>
        </div>

        <div className="hidden sm:flex flex-col text-right border-l-2 border-[#FE4B0F] pl-3">
          <span className="text-[10px] lg:text-[11px] font-semibold text-[#35363A] uppercase tracking-wider">
            FEATURED FLIPBOOK
          </span>
          <span className="text-[9px] lg:text-[10px] font-medium text-[#858585] uppercase tracking-wider">
            LEADING THE INDUSTRY REVOLUTION
          </span>
        </div>
      </div>

      {/* Main Title Row: Why Choose Flipibook ? */}
      <div className="w-full mx-auto mb-16 lg:mb-20">
        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#2B2F38] leading-tight">
          Why Choose <br className="sm:hidden" />
          <span className="text-[#FE4B0F]">Flipibook ?</span>
        </h2>
        <p className="text-xs sm:text-[13px] lg:text-sm text-[#717680] max-w-[440px] mt-3 leading-relaxed font-normal">
          From product catalogues to marketing brochures, create stunning digital experiences that drive engagement and business growth.
        </p>
      </div>

      {/* Milestones Flow Container with Curved Connecting Line */}
      <div className="w-full mx-auto relative pt-8 pb-10">
        
        {/* SVG Curved Dotted Timeline Path behind circle nodes */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 240"
            preserveAspectRatio="none"
            fill="none"
          >
            {/*
              Circle centers in 1000x240 coordinate system:
              Circle 1: x = 125, y = 148
              Circle 2: x = 375, y = 118
              Circle 3: x = 625, y = 88
              Circle 4: x = 875, y = 58
              Plane:    x = 940, y = 8
            */}
            <path
              d="M 60 170
                 C 90 155, 110 150, 125 148
                 C 155 144, 215 170, 250 168
                 C 285 166, 335 125, 375 118
                 C 415 111, 465 140, 500 136
                 C 535 132, 585 95, 625 88
                 C 665 81, 715 108, 750 102
                 C 785 96, 835 65, 875 58
                 C 905 52, 925 25, 940 8"
              stroke="#FE4B0F"
              strokeWidth="1.25"
              strokeDasharray="4 5"
              strokeOpacity="0.8"
            />

            {/* Intermediate Accent Dots on the wave dips between nodes */}
            <circle cx="250" cy="168" r="4" fill="#FE4B0F" />
            <circle cx="500" cy="136" r="4" fill="#FE4B0F" />
            <circle cx="750" cy="102" r="4" fill="#FE4B0F" />
          </svg>

          {/* Paper Plane Image anchored to the end of the curve */}
          <div className="absolute right-4 sm:right-6 lg:right-10 -top-8 lg:-top-10 z-20 pointer-events-none">
            <img
              src={exploreArrowIcon}
              alt="Paper Plane"
              className="w-10 sm:w-11 lg:w-12 h-auto object-contain drop-shadow-sm rotate-3"
            />
          </div>
        </div>

        {/* 4 Milestones Columns with step-stair offsets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 relative z-10 items-start">
          
          {/* Milestone 1: 100+ Happy Clients */}
          <div className="flex flex-col items-center text-center md:translate-y-[90px]">
            <div className="w-18 h-18 sm:w-20 sm:h-20 lg:w-[76px] lg:h-[76px] rounded-full bg-[#f4f5f7] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-white mb-3.5 transition-transform duration-300 hover:scale-105 z-10">
              <Icon icon="mdi:account-group" className="w-7 h-7 sm:w-8 sm:h-8 text-[#5E6470]" />
            </div>
            <h3 className="text-2xl sm:text-[26px] font-bold text-[#1C1D21] leading-none mb-1">
              100+
            </h3>
            <h4 className="text-xs sm:text-sm font-semibold text-[#1C1D21] mb-1">
              Happy Clients
            </h4>
            <p className="text-[11px] sm:text-xs text-[#858585] font-normal leading-relaxed max-w-[170px]">
              Trusted by businesses across various industries
            </p>
          </div>

          {/* Milestone 2: 500+ Flipbooks Created */}
          <div className="flex flex-col items-center text-center md:translate-y-[60px]">
            <div className="w-18 h-18 sm:w-20 sm:h-20 lg:w-[76px] lg:h-[76px] rounded-full bg-[#f4f5f7] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-white mb-3.5 transition-transform duration-300 hover:scale-105 z-10">
              <Icon icon="basil:book-open-outline" className="w-7 h-7 sm:w-8 sm:h-8 text-[#5E6470]" />
            </div>
            <h3 className="text-2xl sm:text-[26px] font-bold text-[#1C1D21] leading-none mb-1">
              500+
            </h3>
            <h4 className="text-xs sm:text-sm font-semibold text-[#1C1D21] mb-1">
              Flipibooks Created
            </h4>
            <p className="text-[11px] sm:text-xs text-[#858585] font-normal leading-relaxed max-w-[170px]">
              From Product catalogues to brand stories
            </p>
          </div>

          {/* Milestone 3: 1M+ Page Views */}
          <div className="flex flex-col items-center text-center md:translate-y-[30px]">
            <div className="w-18 h-18 sm:w-20 sm:h-20 lg:w-[76px] lg:h-[76px] rounded-full bg-[#f4f5f7] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-white mb-3.5 transition-transform duration-300 hover:scale-105 z-10">
              <Icon icon="mdi:eye-outline" className="w-7 h-7 sm:w-8 sm:h-8 text-[#5E6470]" />
            </div>
            <h3 className="text-2xl sm:text-[26px] font-bold text-[#1C1D21] leading-none mb-1">
              1M+
            </h3>
            <h4 className="text-xs sm:text-sm font-semibold text-[#1C1D21] mb-1">
              Page Views
            </h4>
            <p className="text-[11px] sm:text-xs text-[#858585] font-normal leading-relaxed max-w-[170px]">
              Read, share and explore FlipiBooks across the globe.
            </p>
          </div>

          {/* Milestone 4: Global Reach */}
          <div className="flex flex-col items-center text-center md:translate-y-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 lg:w-[76px] lg:h-[76px] rounded-full bg-[#f4f5f7] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-white mb-3.5 transition-transform duration-300 hover:scale-105 z-10">
              <svg
                viewBox="0 0 26 26"
                className="w-7 h-7 sm:w-8 sm:h-8"
                fill="none"
              >
                {/* Globe in #5E6470 */}
                <path
                  fill="#5E6470"
                  d="M13 2C6.383 2 1 7.383 1 14s5.383 12 12 12s12-5.383 12-12c0-2.01-.498-3.896-1.375-5.563c-.133.264-.267.515-.406.782c-.263.508-.54 1.021-.782 1.531c.25.715.422 1.471.5 2.25h-1.312c-.072.335-.125.65-.125.969V15h1.438a9.9 9.9 0 0 1-1.282 4H18.72c.22-.938.347-1.975.437-3.031h-1.97a19 19 0 0 1-.53 3.031H9.343a19.2 19.2 0 0 1-.594-4h7.75v-1.031a4.7 4.7 0 0 0-.125-.969H8.75a19.2 19.2 0 0 1 .594-4h5.344a31 31 0 0 1-.97-2h-3.687c.827-1.887 1.92-3 2.969-3c0-.695.125-1.348.344-1.969C13.229 2.027 13.116 2 13 2M8.875 4.906a12.4 12.4 0 0 0-1 2.094h-2a10 10 0 0 1 3-2.094M4.344 9H7.28a21.4 21.4 0 0 0-.531 4H3.062a9.9 9.9 0 0 1 1.282-4m-1.282 6H6.75c.059 1.425.243 2.77.531 4H4.344a9.9 9.9 0 0 1-1.282-4m2.813 6h2c.288.776.625 1.473 1 2.094a10 10 0 0 1-3-2.094m4.156 0h5.938c-.827 1.887-1.92 3-2.969 3s-2.143-1.113-2.969-3m8.094 0h2a10 10 0 0 1-3 2.094c.375-.62.712-1.317 1-2.094"
                />
                {/* Location pin in #FE4B0F */}
                <path
                  fill="#FE4B0F"
                  d="M19 0c-2.209 0-4 1.793-4 4c0 2.665 3.5 6.306 3.5 9.969h1C19.501 10.306 23 6.77 23 4c0-2.207-1.791-4-4-4m0 1.938a2.063 2.063 0 1 1-.002 4.126A2.063 2.063 0 0 1 19 1.937z"
                />
              </svg>
            </div>
            <h4 className="text-base sm:text-[17px] font-bold text-[#1C1D21] mb-1">
              Global Reach
            </h4>
            <p className="text-[11px] sm:text-xs text-[#858585] font-normal leading-relaxed max-w-[170px]">
              Share Everywhere, Anytime.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}
