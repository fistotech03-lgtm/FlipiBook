import React from 'react';
import { Icon } from '@iconify/react';
import exploreArrowIcon from '../../assets/Home/explore-arrow-icon.png';

export default function WhyChooseFlipibook() {
  return (
    <section className="w-full bg-[#1b222c] text-white py-14 lg:py-[5.5vw] px-4 sm:px-8 lg:px-[6vw] font-poppins relative overflow-hidden">
      
      {/* Top Header Tag Row with Sub-Labels */}
      <div className="w-full mx-auto flex items-center justify-between mb-4 lg:mb-[1.5vw]">
        <div className="flex items-center gap-3">
          <span className="text-xs lg:text-[0.75vw] font-bold tracking-[0.25em] text-gray-400 uppercase">
            WHY FLIPIBOOK
          </span>
          <div className="w-8 lg:w-[2.5vw] h-[1.5px] bg-gray-600"></div>
        </div>

        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[10px] lg:text-[0.7vw] font-bold text-gray-400 uppercase tracking-wider">
            FEATURED FLIPBOOK
          </span>
          <span className="text-[10px] lg:text-[0.7vw] font-bold text-gray-500 uppercase tracking-wider">
            LEADING THE INDUSTRY REVOLUTION
          </span>
        </div>
      </div>

      {/* Main Title Row with Handwritten Script */}
      <div className="w-full mx-auto mb-12 lg:mb-[4.5vw]">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
          <h2 className="text-3xl sm:text-5xl lg:text-[4.2vw] font-extrabold tracking-tight text-white leading-none uppercase">
            WHY CHOOSE FLIPBOOK ?
          </h2>
          <span className="font-serif italic text-sm sm:text-xl lg:text-[1.3vw] text-[#ea7233] font-semibold tracking-wide lowercase">
            the Next level Experience
          </span>
        </div>
        <p className="text-xs sm:text-sm lg:text-[0.9vw] text-gray-400 max-w-[500px] mt-3 leading-relaxed">
          From product catalogues to marketing brochures, create stunning digital experiences that drive engagement and business growth.
        </p>
      </div>

      {/* Dynamic Milestones Timeline with Wave Line & Paper Plane */}
      <div className="w-full mx-auto relative pt-4 pb-6">
        
        {/* SVG Curved Dotted Timeline Path */}
        <div className="absolute inset-x-0 top-10 pointer-events-none hidden md:block z-0">
          <svg className="w-full h-[120px] overflow-visible" viewBox="0 0 1100 120" fill="none">
            <path
              d="M 120 70 C 260 95, 380 40, 500 55 C 650 75, 750 30, 890 20 C 970 15, 1020 5, 1080 -10"
              stroke="#ea7233"
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeOpacity="0.8"
            />
            {/* Dots */}
            <circle cx="310" cy="70" r="3" fill="#ea7233" />
            <circle cx="680" cy="55" r="3" fill="#ea7233" />
            <circle cx="780" cy="38" r="3" fill="#ea7233" />
          </svg>

          {/* Plane Flight Icon */}
          <div className="absolute right-4 -top-8 z-20">
            <img src={exploreArrowIcon} alt="Plane Icon" className="w-12 lg:w-[3.8vw] h-auto object-contain drop-shadow-md" />
          </div>
        </div>

        {/* 4 Milestones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10 items-start">
          
          {/* Milestone 1: 100+ Happy Clients */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-[5.8vw] lg:h-[5.8vw] rounded-full bg-white text-[#1b222c] flex items-center justify-center shadow-lg mb-3 transition-transform duration-300 group-hover:scale-105">
              <Icon icon="mdi:account-group-outline" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-[2.8vw] lg:h-[2.8vw] text-[#ea7233]" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-[2.2vw] font-extrabold text-[#ea7233] leading-none mb-1">
              100+
            </h3>
            <h4 className="text-sm sm:text-base lg:text-[0.95vw] font-bold text-white mb-1">
              Happy Clients
            </h4>
            <p className="text-[11px] sm:text-xs lg:text-[0.75vw] text-gray-400 font-normal leading-relaxed max-w-[200px]">
              Trusted by businesses across various industries
            </p>
          </div>

          {/* Milestone 2: 500+ Flipbooks Created */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-[5.8vw] lg:h-[5.8vw] rounded-full bg-white text-[#1b222c] flex items-center justify-center shadow-lg mb-3 transition-transform duration-300 group-hover:scale-105">
              <Icon icon="lucide:book-open" className="w-7 h-7 sm:w-9 sm:h-9 lg:w-[2.6vw] lg:h-[2.6vw] text-[#ea7233] stroke-[2.2]" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-[2.2vw] font-extrabold text-[#ea7233] leading-none mb-1">
              500+
            </h3>
            <h4 className="text-sm sm:text-base lg:text-[0.95vw] font-bold text-white mb-1">
              Flipbooks Created
            </h4>
            <p className="text-[11px] sm:text-xs lg:text-[0.75vw] text-gray-400 font-normal leading-relaxed max-w-[200px]">
              From Product catalogues to brand stories
            </p>
          </div>

          {/* Milestone 3: 1M+ Page Views */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-[5.8vw] lg:h-[5.8vw] rounded-full bg-white text-[#1b222c] flex items-center justify-center shadow-lg mb-3 transition-transform duration-300 group-hover:scale-105">
              <Icon icon="mdi:eye-outline" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-[2.8vw] lg:h-[2.8vw] text-[#ea7233]" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-[2.2vw] font-extrabold text-[#ea7233] leading-none mb-1">
              1M+
            </h3>
            <h4 className="text-sm sm:text-base lg:text-[0.95vw] font-bold text-white mb-1">
              Page Views
            </h4>
            <p className="text-[11px] sm:text-xs lg:text-[0.75vw] text-gray-400 font-normal leading-relaxed max-w-[200px]">
              Read, share and explore Flipibooks across the globe.
            </p>
          </div>

          {/* Milestone 4: Global Reach */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-[5.8vw] lg:h-[5.8vw] rounded-full bg-white text-[#1b222c] flex items-center justify-center shadow-lg mb-3 transition-transform duration-300 group-hover:scale-105">
              <Icon icon="fluent:globe-location-24-regular" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-[2.8vw] lg:h-[2.8vw] text-[#ea7233]" />
            </div>
            <h4 className="text-sm sm:text-base lg:text-[1.05vw] font-bold text-white mb-1 mt-1 sm:mt-2">
              Global Reach
            </h4>
            <p className="text-[11px] sm:text-xs lg:text-[0.75vw] text-gray-400 font-normal leading-relaxed max-w-[180px]">
              Share Everywhere, Anytime.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}
