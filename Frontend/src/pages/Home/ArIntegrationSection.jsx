import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import arViewImg from '../../assets/Home/final-images/ar-integration/ar-integration.webp';

export default function ArIntegrationSection() {
  return (
    <motion.section initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }} className="relative w-full bg-white font-poppins overflow-hidden">
      
      {/* 2-Column Layout: Left Content with comfortable padding | Right Docked to bottom-right corner */}
      <div className="w-full flex flex-col lg:flex-row items-stretch justify-between min-h-[460px] sm:min-h-[520px] lg:min-h-[42vw]">
        
        {/* Left Column: Lowered slightly with pt-10 sm:pt-14 lg:pt-[5vw] */}
        <div className="w-full lg:w-[46%] xl:w-[44%] flex flex-col justify-start text-left pt-10 sm:pt-14 lg:pt-[5.2vw] pb-10 sm:pb-14 lg:pb-[3.5vw] pl-6 sm:pl-10 lg:pl-[5.5vw] pr-6 lg:pr-4 z-10 shrink-0">
          
          {/* 1. Top Header Tag: AR INTEGRATION with horizontal rule */}
          <div className="flex items-center gap-3.5 mb-5 sm:mb-7 lg:mb-[1.8vw]">
            <span className="text-[11px] sm:text-xs lg:text-[0.82vw] font-bold tracking-[0.25em] text-[#35363A] uppercase">
              AR INTEGRATION
            </span>
            <div className="w-10 sm:w-12 lg:w-[3.2vw] h-[1.5px] bg-[#9ca0a6]"></div>
          </div>

          {/* 2. Headline: Big font size & font-bold as requested */}
          <div className="mb-4 sm:mb-5 lg:mb-[1.4vw]">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5vw] xl:text-[4.8vw] font-bold leading-[1.05] tracking-tight">
              <span className="text-[#2B3037] block">See Products</span>
              <span className="text-[#EC5137] block mt-0.5 sm:mt-1 lg:mt-[0.2vw]">in Real Space</span>
            </h2>
          </div>

          {/* 3. Divider line under headline */}
          <div className="w-48 sm:w-56 lg:w-[15vw] h-[1px] bg-[#d2d5d8] mb-5 sm:mb-6 lg:mb-[1.6vw]"></div>

          {/* 4. Description Paragraph */}
          <p className="text-xs sm:text-[13.5px] lg:text-[0.92vw] text-[#787D85] font-normal leading-[1.65] max-w-[360px] lg:max-w-[22vw] mb-8 sm:mb-10 lg:mb-[2.6vw]">
            Bring your products to life with AR. Scan the QR code from your flipbook and view 3D models in your space.
          </p>

          {/* 5. Three Circular Badges Row */}
          <div className="flex items-start gap-6 sm:gap-8 lg:gap-[2.6vw]">
            
            {/* Badge 1: Realistic 3D Models */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[4.2vw] lg:h-[4.2vw] rounded-full flex items-center justify-center text-[#EC5137] mb-2.5"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="energy-icons:cube-20" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-[1.8vw] lg:h-[1.8vw]" />
              </div>
              <span className="text-xs sm:text-sm lg:text-[0.92vw] font-bold text-[#1C1D21] leading-tight">
                Realistic
              </span>
              <span className="text-[11px] sm:text-xs lg:text-[0.75vw] text-[#858585] leading-tight mt-1 font-normal">
                3D Models
              </span>
            </div>

            {/* Badge 2: View at Actual Size */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[4.2vw] lg:h-[4.2vw] rounded-full flex items-center justify-center text-[#EC5137] mb-2.5"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="carbon:carbon-for-mobile" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-[1.8vw] lg:h-[1.8vw]" />
              </div>
              <span className="text-xs sm:text-sm lg:text-[0.92vw] font-bold text-[#1C1D21] leading-tight">
                View at
              </span>
              <span className="text-[11px] sm:text-xs lg:text-[0.75vw] text-[#858585] leading-tight mt-1 font-normal">
                Actual Size
              </span>
            </div>

            {/* Badge 3: 360° Interaction */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[4.2vw] lg:h-[4.2vw] rounded-full flex items-center justify-center text-[#EC5137] mb-2.5"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="andrsrxn:rotate-3d" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-[1.8vw] lg:h-[1.8vw]" />
              </div>
              <span className="text-xs sm:text-sm lg:text-[0.92vw] font-bold text-[#1C1D21] leading-tight">
                360°
              </span>
              <span className="text-[11px] sm:text-xs lg:text-[0.75vw] text-[#858585] leading-tight mt-1 font-normal">
                Interaction
              </span>
            </div>

          </div>

        </div>

        {/* Right Column: Responsively sized & docked to bottom-right corner across screens */}
        <div className="w-full lg:w-[54%] xl:w-[56%] flex items-end justify-center lg:justify-end self-end pointer-events-none select-none mt-6 sm:mt-8 lg:mt-0">
          <img
            src={arViewImg}
            alt="AR Real Space Experience"
            className="w-full max-w-[540px] sm:max-w-[640px] md:max-w-[720px] lg:max-w-none h-auto max-h-[460px] sm:max-h-[540px] md:max-h-[600px] lg:max-h-[44vw] xl:max-h-[740px] object-contain object-bottom lg:object-right-bottom block"
          />
        </div>

      </div>

    </motion.section>
  );
}