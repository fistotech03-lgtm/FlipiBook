import React from 'react';
import { Icon } from '@iconify/react';
import arViewImg from '../../assets/Home/final-images/ar-integration/ar-integration.webp';

export default function ArIntegrationSection() {
  return (
    <section className="w-full bg-white py-12 lg:py-[5vw] px-4 sm:px-8 lg:px-[6vw] font-poppins border-t border-gray-100">
      <div className="w-full mx-auto flex flex-col space-y-4">
        
        {/* Top Header Tag */}
        <div className="flex items-center gap-3">
          <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-gray-700 uppercase">
            AR INTEGRATION
          </span>
          <div className="w-8 lg:w-[2.5vw] h-[1.5px] bg-gray-400"></div>
        </div>

        {/* 2-Column Grid: Left Copy & Badges | Right AR Phone & Open Catalogue Hand Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2">
          
          {/* Left Column (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-4 lg:space-y-[1.4vw]">
            <h2 className="text-3xl sm:text-4xl lg:text-[3.2vw] font-bold text-[#1b222c] leading-[1.12] tracking-tight">
              See Products <br />
              <span className="text-[#ea7233]">in Real Space</span>
            </h2>

            <p className="text-xs sm:text-sm lg:text-[0.9vw] text-gray-500 font-normal leading-relaxed max-w-[380px]">
              Bring your products to life with AR. Scan the QR code from your flipbook and view 3D models in your space.
            </p>

            {/* 3 Circular Badges Row: Realistic 3D Models | View at Actual Size | 360° Interaction */}
            <div className="flex items-start gap-5 lg:gap-[1.8vw] pt-2">
              {/* Badge 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 lg:w-[3.4vw] lg:h-[3.4vw] rounded-full border border-orange-200 bg-orange-50/50 flex items-center justify-center text-[#ea7233] mb-1.5 shadow-xs">
                  <Icon icon="fluent:cube-32-regular" className="w-5 h-5 lg:w-[1.6vw] lg:h-[1.6vw]" />
                </div>
                <span className="text-xs lg:text-[0.82vw] font-bold text-[#1b222c] leading-tight">
                  Realistic
                </span>
                <span className="text-[10px] lg:text-[0.68vw] text-gray-400 leading-tight">
                  3D Models
                </span>
              </div>

              {/* Badge 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 lg:w-[3.4vw] lg:h-[3.4vw] rounded-full border border-orange-200 bg-orange-50/50 flex items-center justify-center text-[#ea7233] mb-1.5 shadow-xs">
                  <Icon icon="lucide:scan" className="w-5 h-5 lg:w-[1.5vw] lg:h-[1.5vw]" />
                </div>
                <span className="text-xs lg:text-[0.82vw] font-bold text-[#1b222c] leading-tight">
                  View at
                </span>
                <span className="text-[10px] lg:text-[0.68vw] text-gray-400 leading-tight">
                  Actual Size
                </span>
              </div>

              {/* Badge 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 lg:w-[3.4vw] lg:h-[3.4vw] rounded-full border border-orange-200 bg-orange-50/50 flex items-center justify-center text-[#ea7233] mb-1.5 shadow-xs">
                  <Icon icon="mdi:rotate-360" className="w-6 h-6 lg:w-[1.7vw] lg:h-[1.7vw]" />
                </div>
                <span className="text-xs lg:text-[0.82vw] font-bold text-[#1b222c] leading-tight">
                  360°
                </span>
                <span className="text-[10px] lg:text-[0.68vw] text-gray-400 leading-tight">
                  Interaction
                </span>
              </div>
            </div>

          </div>

          {/* Right Column (col-span-7): Hand holding phone scanning flipbook catalogue page */}
          <div className="lg:col-span-7 flex items-center justify-center relative">
            <div className="relative w-full max-w-[620px] lg:max-w-none">
              <img
                src={arViewImg}
                alt="AR Real Space Experience"
                className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.18)] hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
