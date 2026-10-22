import React from 'react';
import { Icon } from '@iconify/react';
import arViewImg from '../../assets/Home/final-images/ar-integration/ar-integration.webp';

export default function ArIntegrationSection() {
  return (
    <section className="relative w-full bg-white font-poppins border-t border-gray-100 overflow-hidden">
      
      {/* 2-Column Grid: Left Content with padding | Right Full-Bleed Mockup */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-between">
        
        {/* Left Column: Content */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center text-left pt-12 lg:pt-16 pb-12 lg:pb-16 pl-6 sm:pl-10 lg:pl-[6.5vw] pr-6 lg:pr-8 space-y-6 lg:space-y-[1.6vw] z-10 shrink-0">
          
          {/* Top Header Tag: #35363A */}
          <div className="flex items-center gap-3">
            <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-[#35363A] uppercase">
              AR INTEGRATION
            </span>
            <div className="w-8 lg:w-[2.5vw] h-[1.5px] bg-[#35363A]/40"></div>
          </div>

          {/* Heading: See Products (#35363A) in Real Space (#EC5137) */}
          <h2 className="text-4xl sm:text-5xl lg:text-[3.8vw] font-bold leading-[1.08] tracking-tight">
            <span className="text-[#35363A]">See Products</span> <br />
            <span className="text-[#EC5137]">in Real Space</span>
          </h2>

          {/* Description: #858585 */}
          <p className="text-xs sm:text-[13px] lg:text-[0.9vw] text-[#858585] font-normal leading-relaxed max-w-[360px]">
            Bring your products to life with AR. Scan the QR code from your flipbook and view 3D models in your space.
          </p>

          {/* 3 Circular Badges Row */}
          <div className="flex items-start gap-6 sm:gap-7 lg:gap-[2.2vw] pt-2">
            
            {/* Badge 1: Realistic 3D Models */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 lg:w-[3.6vw] lg:h-[3.6vw] rounded-full flex items-center justify-center text-[#EC5137] mb-2 shadow-2xs"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="energy-icons:cube-20" className="w-6 h-6 lg:w-[1.6vw] lg:h-[1.6vw]" />
              </div>
              <span className="text-xs sm:text-[13px] lg:text-[0.85vw] font-medium text-[#0C161E] leading-tight">
                Realistic
              </span>
              <span className="text-[10px] sm:text-[11px] lg:text-[0.7vw] text-[#858585] leading-tight mt-0.5 font-regular">
                3D Models
              </span>
            </div>

            {/* Badge 2: View at Actual Size */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 lg:w-[3.6vw] lg:h-[3.6vw] rounded-full flex items-center justify-center text-[#EC5137] mb-2 shadow-2xs"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="carbon:carbon-for-mobile" className="w-6 h-6 lg:w-[1.6vw] lg:h-[1.6vw]" />
              </div>
              <span className="text-xs sm:text-[13px] lg:text-[0.85vw] font-medium text-[#0C161E] leading-tight">
                View at
              </span>
              <span className="text-[10px] sm:text-[11px] lg:text-[0.7vw] text-[#858585] leading-tight mt-0.5 font-regular">
                Actual Size
              </span>
            </div>

            {/* Badge 3: 360° Interaction */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 lg:w-[3.6vw] lg:h-[3.6vw] rounded-full flex items-center justify-center text-[#EC5137] mb-2 shadow-2xs"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="andrsrxn:rotate-3d" className="w-6 h-6 lg:w-[1.6vw] lg:h-[1.6vw]" />
              </div>
              <span className="text-xs sm:text-[13px] lg:text-[0.85vw] font-medium text-[#0C161E] leading-tight">
                360°
              </span>
              <span className="text-[10px] sm:text-[11px] lg:text-[0.7vw] text-[#858585] leading-tight mt-0.5 font-regular">
                Interaction
              </span>
            </div>

          </div>

        </div>

        {/* Right Column: Full-bleed image touching right and bottom edges with bottom-right anchor */}
        <div className="w-full lg:w-[55%] flex items-end justify-end self-end pt-4 lg:pt-0">
          <img
            src={arViewImg}
            alt="AR Real Space Experience"
            className="w-full h-auto object-contain object-right-bottom block translate-y-1 lg:translate-y-2"
          />
        </div>

      </div>

    </section>
  );
}
