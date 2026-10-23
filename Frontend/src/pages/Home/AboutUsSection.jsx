import React from 'react';
import { motion } from 'framer-motion';
import aboutUsImg from '../../assets/Home/final-images/about-us/about-us-image.png';

export default function AboutUsSection() {
  return (
    <motion.section initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }} className="w-full bg-[#E2E2E2] font-poppins relative overflow-hidden select-none pt-5 sm:pt-7 lg:pt-[1.8vw] pb-4 sm:pb-6 lg:pb-0">
      
      {/* Top Header Tag: Guaranteed above all graphics */}
      <div className="w-full px-5 sm:px-8 lg:px-[4.5vw] mb-1 sm:mb-2 lg:mb-[0.4vw] flex items-center gap-3 relative z-30">
        <span className="text-[11px] sm:text-xs lg:text-[0.82vw] font-bold tracking-[0.25em] text-[#222428] uppercase">
          ABOUT US
        </span>
        <div className="w-8 sm:w-10 lg:w-[2.8vw] h-[1.5px] bg-[#8d9095]"></div>
      </div>

      {/* Main Section Content Area - 100% proportional vw-driven for desktop, stacked on mobile/tablet */}
      <div className="w-full relative min-h-0 lg:min-h-[38vw] lg:h-[38vw] flex flex-col lg:flex-row items-stretch">
        
        {/* 3D Monitor on Black Rock Display: Relative on mobile/tablet, pinned on desktop */}
        <div className="w-full order-2 lg:order-1 lg:absolute lg:inset-x-0 lg:bottom-0 lg:top-0 flex items-end justify-center lg:justify-start pointer-events-none z-0 mt-4 sm:mt-6 lg:mt-0">
          <img
            src={aboutUsImg}
            alt="Flipibook Interactive 3D Catalogue Platform"
            className="w-full max-w-[500px] sm:max-w-[700px] md:max-w-[850px] lg:max-w-[85vw] max-h-[320px] sm:max-h-[440px] md:max-h-[500px] lg:max-h-[38vw] h-auto object-contain object-bottom lg:object-left-bottom block -ml-0 lg:-ml-[1vw]"
          />
        </div>

        {/* Right-aligned Content Layer - Strictly proportional vw on desktop */}
        <div className="order-1 lg:order-2 relative z-20 w-full flex flex-col items-center lg:items-end text-center lg:text-right px-5 sm:px-8 lg:px-[4.8vw] pt-1 sm:pt-2 lg:pt-[0.5vw] pb-2 sm:pb-4 lg:pb-[1.5vw] pointer-events-auto h-full justify-between">
          <div className="w-full max-w-[420px] sm:max-w-[500px] md:max-w-[560px] lg:max-w-[31vw] flex flex-col items-center lg:items-end justify-between h-full flex-1">
            
            {/* Top Container: Headline & Divider */}
            <div className="w-full flex flex-col items-center lg:items-end">
              {/* Headline Group */}
              <div className="flex flex-col items-center lg:items-end w-full">
                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.8vw] font-bold text-[#0D0F11] tracking-tight leading-[0.98] block">
                  We
                </span>
                
                <h2
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.8vw] font-bold tracking-tight leading-[0.98] block my-0.5 sm:my-1 lg:my-[0.15vw]"
                  style={{
                    color: 'transparent',
                    WebkitTextStroke: '0.07vw #878c92',
                    textStroke: '0.07vw #878c92',
                  }}
                >
                  Transform
                </h2>

                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.8vw] font-bold text-[#0D0F11] tracking-tight leading-[0.98] block">
                  Digital Ideas
                </span>
              </div>

              {/* Subtle Separator Line beneath Headline */}
              <div className="w-full max-w-[260px] sm:max-w-[340px] lg:max-w-full h-[1px] bg-[#c2c5c9] mt-4 sm:mt-8 lg:mt-[2.2vw] mb-3 sm:mb-6 lg:mb-[1.8vw]"></div>
            </div>

            {/* Bottom/Narrative Paragraphs Container: Proportional vw on desktop */}
            <div className="w-full max-w-[360px] sm:max-w-[440px] lg:max-w-[22vw] flex flex-col items-center lg:items-end space-y-3 sm:space-y-6 lg:space-y-[1.6vw] text-xs sm:text-[14px] md:text-[15px] lg:text-[0.94vw] text-[#2b2e34] font-normal leading-[1.7] pb-1 sm:pb-4 lg:pb-[1vw]">
              <p>
                Flipibook by FIST-O Tech Pvt Ltd transforms static catalogues into Interactive Digital Experiences through IDC, AR/VR/MR, 2D/3D Animation, 3D Website design, Custom web and Mobile app development.
              </p>
              <p>
                We help businesses showcase products, simplify ideas, and engage audiences through innovative digital solutions.
              </p>
            </div>

          </div>
        </div>

      </div>

    </motion.section>
  );
}
