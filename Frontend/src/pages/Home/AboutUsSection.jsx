import React from 'react';
import { motion } from 'framer-motion';
import aboutUsImg from '../../assets/Home/final-images/about-us/about-us-image.png';

export default function AboutUsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="w-full bg-[#E2E2E2] font-poppins relative overflow-hidden select-none pt-6 sm:pt-8 md:pt-10 lg:pt-[3.5vw] pb-0"
    >
      {/* Top Header Tag: Aligned to the left margin on mobile/tablet, standard on desktop */}
      <div className="w-full px-6 sm:px-8 md:px-10 lg:px-[4.5vw] mb-2 sm:mb-4 md:mb-6 lg:mb-[1.2vw] flex items-center justify-start gap-3 relative z-30">
        <span className="text-[11px] sm:text-xs lg:text-[0.82vw] font-bold tracking-[0.25em] text-[#222428] uppercase">
          ABOUT US
        </span>
        <div className="w-8 sm:w-10 lg:w-[2.8vw] h-[1.5px] bg-[#8d9095]"></div>
      </div>

      {/* Main Section Content Area: Stacked vertically on Mobile & Tablet (< lg), Side-by-side on Desktop (lg+) */}
      <div className="w-full relative min-h-0 lg:min-h-[40vw] lg:h-[40vw] flex flex-col lg:flex-row items-stretch">
        
        {/* 3D Monitor on Black Rock Display: Relative & centered at bottom on mobile/tablet, pinned with top spacing on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="w-full order-2 lg:order-1 lg:absolute lg:inset-x-0 lg:bottom-0 lg:top-[1.5vw] flex items-end justify-center lg:justify-start pointer-events-none z-0 mt-6 sm:mt-8 md:mt-12 lg:mt-0"
        >
          <img
            src={aboutUsImg}
            alt="Flipibook Interactive 3D Catalogue Platform"
            className="w-full max-w-[480px] sm:max-w-[680px] md:max-w-[840px] lg:max-w-[85vw] max-h-[320px] sm:max-h-[440px] md:max-h-[520px] lg:max-h-[38vw] h-auto object-contain object-bottom lg:object-left-bottom block -mb-1 lg:mb-0 -ml-0 lg:-ml-[1vw]"
          />
        </motion.div>

        {/* Content Layer: Left-aligned on mobile & tablet, Right-aligned on desktop */}
        <div className="order-1 lg:order-2 relative z-20 w-full flex flex-col items-start lg:items-end text-left lg:text-right px-6 sm:px-8 md:px-10 lg:px-[4.8vw] pt-1 sm:pt-2 md:pt-3 lg:pt-0 pb-2 sm:pb-3 lg:pb-0 pointer-events-auto h-full justify-start lg:justify-center">
          <div className="w-full max-w-full lg:max-w-[31vw] flex flex-col items-start lg:items-end justify-start lg:justify-start h-full flex-1 lg:gap-[1vw]">
            
            {/* Top Container: Headline & Divider */}
            <div
              className="w-full flex flex-col items-start lg:items-end"
            >
              {/* Headline Group: 'We Transform' in 1 line on mobile & tab, 'Digital Ideas' in another line, all left-aligned */}
              <motion.div
                initial={{ opacity: 0, y: -25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-start lg:items-end w-full"
              >
                {/* Line 1: 'We Transform' side-by-side on mobile/tablet, stacked on desktop */}
                <div className="flex flex-row lg:flex-col items-baseline lg:items-end justify-start gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-0">
                  <span className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.8vw] font-bold text-[#0D0F11] tracking-tight leading-[1.08] lg:leading-[0.98] inline-block lg:block">
                    We
                  </span>
                  
                  <h2
                    className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.8vw] font-bold tracking-tight leading-[1.08] lg:leading-[0.98] inline-block lg:block lg:my-[0.15vw] text-[#8E9298] lg:text-transparent lg:[-webkit-text-stroke:0.07vw_#878c92]"
                  >
                    Transform
                  </h2>
                </div>

                {/* Line 2: 'Digital Ideas' */}
                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.8vw] font-bold text-[#0D0F11] tracking-tight leading-[1.08] lg:leading-[0.98] block mt-0.5 sm:mt-1.5 md:mt-2.5 lg:mt-0">
                  Digital Ideas
                </span>
              </motion.div>

              {/* Subtle Separator Line beneath Headline */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[260px] sm:max-w-[360px] md:max-w-[460px] lg:max-w-full h-[1px] bg-[#c2c5c9] mt-3 sm:mt-5 md:mt-7 lg:mt-[2.2vw] mb-3 sm:mb-5 md:mb-7 lg:mb-[1.8vw] origin-left lg:origin-right"
              ></motion.div>
            </div>

            {/* Bottom/Narrative Paragraphs Container: Full width and justify alignment on mobile & tablet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-full lg:max-w-[22vw] flex flex-col items-start lg:items-end space-y-2.5 sm:space-y-4 md:space-y-5 lg:space-y-[1.6vw] text-xs sm:text-[14px] md:text-[16px] lg:text-[0.94vw] text-[#2b2e34] font-normal leading-[1.65] sm:leading-[1.75] md:leading-[1.85] text-justify lg:text-right pb-1 sm:pb-2 lg:pb-[1vw]"
            >
              <p>
                Flipibook by FIST-O Tech Pvt Ltd transforms static catalogues into Interactive Digital Experiences through IDC, AR/VR/MR, 2D/3D Animation, 3D Website design, Custom web and Mobile app development.
              </p>
              <p>
                We help businesses showcase products, simplify ideas, and engage audiences through innovative digital solutions.
              </p>
            </motion.div>

          </div>
        </div>

      </div>

    </motion.section>
  );
}
