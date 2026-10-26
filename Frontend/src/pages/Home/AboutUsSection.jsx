import React from 'react';
import { motion } from 'framer-motion';
import aboutUsImg from '../../assets/Home/final-images/about-us/about-us-image.png';

export default function AboutUsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
      transition={{ duration: 0.8 }}
      className="w-full bg-[#E2E2E2] font-poppins relative overflow-hidden pt-6 sm:pt-8 md:pt-10 lg:pt-[3.5vw] pb-0"
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
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
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
              {/* Headline Group: 'We Make' on single line & 'Your Products Interactive' */}
              <motion.div
                initial={{ opacity: 0, y: -25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-start lg:items-end w-full"
              >
                {/* Line 1: 'We Make' in a single line on all screen sizes */}
                <div className="flex items-baseline justify-start lg:justify-end gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-[0.8vw]">
                  <span className="text-3xl sm:text-5xl md:text-5xl lg:text-[3.8vw] font-bold text-[#0D0F11] tracking-tight leading-[1.08] inline-block">
                    We
                  </span>
                  
                  <h2
                    className="text-3xl sm:text-5xl md:text-5xl lg:text-[3.8vw] font-bold tracking-tight leading-[1.08] inline-block text-[#8E9298] lg:text-transparent lg:[-webkit-text-stroke:0.07vw_#878c92]"
                  >
                    Make
                  </h2>
                </div>

                {/* Line 2: 'Your Products Interactive' */}
                <span className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.4vw] font-bold text-[#0D0F11] tracking-tight leading-[1.08] block mt-0.5 sm:mt-1 lg:mt-[0.2vw]">
                  Your Products <span className="text-[#EC5137]">Interactive</span>
                </span>
              </motion.div>

              {/* Subtle Separator Line beneath Headline */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
                transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[260px] sm:max-w-[360px] md:max-w-[460px] lg:max-w-full h-[1px] bg-[#c2c5c9] mt-2.5 sm:mt-3.5 md:mt-4 lg:mt-[1.2vw] mb-2.5 sm:mb-3.5 md:mt-4 lg:mb-[1vw] origin-left lg:origin-right"
              ></motion.div>
            </div>

            {/* Bottom/Narrative Paragraphs Container: Full width and justify alignment on mobile & tablet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-full lg:max-w-[26vw] flex flex-col items-start lg:items-end text-xs sm:text-[13px] md:text-[14px] lg:text-[0.88vw] text-[#2b2e34] font-normal leading-[1.55] sm:leading-[1.65] lg:leading-[1.5vw] text-justify lg:text-right pb-1 sm:pb-2"
            >
              <p className="leading-[1.55] sm:leading-[1.65] lg:leading-[1.5vw]">
                FlipiBook by Fisto Tech Pvt Ltd turns static PDFs into interactive digital catalogues. Combine product videos, 3D models, and clickable links to help customers explore your products and understand how they work.
              </p>
              <p className="mt-2.5 sm:mt-3 lg:mt-[1.5vw] leading-[1.55] sm:leading-[1.65] lg:leading-[1.5vw]">
                Based in Coimbatore, Fisto Tech creates 3D animations, AR/VR experiences, 3D websites, and custom applications for businesses in India and worldwide. We help you explain complex products clearly and make it easier for customers to take the next step.
              </p>

              {/* Button: Discover FlipiBook */}
              <div className="pt-1.5 sm:pt-2 lg:mt-[1vw]">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('why-choose-flipibook') || document.querySelector('[class*="WhyChooseFlipibook"]');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#0D0F11] hover:bg-[#EC5137] text-white rounded-lg text-xs sm:text-sm lg:text-[0.8vw] font-medium shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <span>Discover FlipiBook</span>
                </button>
              </div>
            </motion.div>

          </div>
        </div>

      </div>

    </motion.section>
  );
}
